import { describe, expect, it, vi } from 'vitest';
import { createDashboardSource } from '../src/api/dashboard-source';
import { dashboardSummary } from '../src/models/dashboard-model';

const payload = {
    kpiReceitas: ['CRECHE', 'HOTEL', 'DAYUSE'].map(categoria => ({ categoria, acumuladoMes: 123.45, meta: 200, percentualMeta: 61.7 })),
    planosAtivos: { planosAtivos: 9 },
    agendamentosPorServico: [{ servico: 'CRECHE', quantidadeAgendada: 4 }],
    graficoReceita: [{ mesReferencia: 'outubro/2026', receitaPrevista: 200, receitaRecebida: 123.45 }],
    graficoNovosServicos: [{ mesReferencia: '2026-10', creche: 2, hotel: 1, dayUse: 3 }],
    graficoContratosPorServico: [{ categoria: 'CRECHE', quantidade: 9 }, { categoria: 'Inativos', quantidade: 2 }],
    ultimasMovimentacoes: [{ dataPagamento: '2026-10-26', servico: 'Creche mensal', pet: 'Rex', valor: 123.45 }],
};
describe('dashboard backend source', () => {
    it('queries exact dates and persists goals using real service IDs', async () => {
        const request = vi.fn(async (url, options) => {
            expect(options.headers.Authorization).toBe('Bearer token');
            if (options.method === 'GET') {
                expect(new URL(url).searchParams.get('servico')).toBe('CRECHE');
                expect(new URL(url).searchParams.get('mesReferencia')).toBe('2026-10-26');
                return new Response(JSON.stringify([{ idMeta: 7, mesReferencia: '2026-10-26', valor: 250, servico: { idServico: 3 } }]), { status: 200 });
            }
            expect(JSON.parse(options.body)).toEqual({ mesReferencia: '2026-10-26', valor: 250, servico: { idServico: 3 } });
            return new Response('{}', { status: 201 });
        });
        const source = createDashboardSource('http://localhost:8080', request, 'token');
        expect(await source.goals('2026-10-26', { id: '3', category: 'CRECHE' })).toEqual([{ id: '7', period: '2026-10-26', service: '3', cents: 25000 }]);
        await source.saveGoal('2026-10-26', '3', 250);
        await source.saveGoal('2026-10-26', '3', 250, '7');
        expect(request.mock.calls[1][1].method).toBe('POST');
        expect(request.mock.calls[2][0]).toBe('http://localhost:8080/dashboard/metas/7');
        expect(request.mock.calls[2][1].method).toBe('PUT');
    });
    it('clears the session on HTTP 401, but not on access denial', async () => {
        const expire = vi.fn();
        for (const status of [401, 403]) {
            const source = createDashboardSource('http://localhost:8080', async () => new Response('{}', { status }), 'token', expire);
            await expect(source.load()).rejects.toMatchObject({ status });
        }
        expect(expire).toHaveBeenCalledTimes(1);
    });
    it('sends the administrator token with the dashboard request', async () => {
        const source = createDashboardSource('http://localhost:8080', async (_url, options) => {
            expect(options.headers.Authorization).toBe('Bearer admin-token');
            return new Response(JSON.stringify(payload), { status: 200 });
        }, 'admin-token');
        await expect(source.load()).resolves.toHaveProperty('summary');
    });
    it('loads server aggregates without synthesizing individual entities', async () => {
        const source = createDashboardSource('http://localhost:8080', async url => {
            expect(url).toBe('http://localhost:8080/dashboard');
            return new Response(JSON.stringify(payload), { status: 200 });
        });
        const data = await source.load();
        const view = dashboardSummary(data);
        expect(data.contracts).toEqual([]);
        expect(data.pets).toEqual([]);
        expect(view.activeContracts).toBe(9);
        expect(view.monthly[0]).toMatchObject({ received: 12345, goal: 20000, percentage: 61.7 });
        expect(view.occupancy[0]).toMatchObject({ count: 4, capacity: undefined });
        expect(view.revenueSeries[0]).toEqual({ period: '2026-10', forecast: 20000, received: 12345 });
        expect(view.contractSeries[0].counts).toEqual([2, 1, 3]);
        expect(view.distribution).toMatchObject({ counts: [9, 0, 0, 2], unit: 'contratos' });
        expect(view.movements[0]).toMatchObject({ petName: 'Rex', cents: 12345 });
    });
    it('reports connection errors', async () => {
        const source = createDashboardSource('http://localhost:8080', async () => { throw new Error('offline'); });
        await expect(source.load()).rejects.toThrow('Não foi possível conectar');
    });
});
