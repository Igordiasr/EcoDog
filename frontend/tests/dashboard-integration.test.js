import { expect, it, vi } from 'vitest';
import { createDashboardSource } from '../src/api/dashboard-source';
import { validateDashboardForm } from '../src/models/dashboard-validation';

const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const summary = {
    kpiReceitas: ['CRECHE', 'HOTEL', 'DAYUSE'].map(categoria => ({ categoria, acumuladoMes: 10, meta: 100, percentualMeta: 10 })),
    planosAtivos: { planosAtivos: 2 }, agendamentosPorServico: [{ servico: 'CRECHE', quantidadeAgendada: 4 }, { servico: 'DAYUSE', quantidadeAgendada: 3 }],
    graficoReceita: [{ mesReferencia: 'março/2026', receitaPrevista: 20, receitaRecebida: 10 }],
    graficoNovosServicos: [{ mesReferencia: 'março/2026', creche: 1, hotel: 2, dayUse: 3 }],
    graficoContratosPorServico: [{ categoria: 'CRECHE', quantidade: 2 }, { categoria: 'Inativos', quantidade: 1 }], ultimasMovimentacoes: [],
};

it('carrega indicadores reais e capacidades configuradas com autenticação', async () => {
    const request = vi.fn(async url => url.includes('/calendario/dia') ? response({ idCalendario: 4, data: new URL(url).searchParams.get('data'), vagasCreche: 10, vagasHotel: 8 }) : response(summary));
    const data = await createDashboardSource('http://localhost:8080', request, 'token').load();
    expect(data.summary.occupancy).toEqual([{ service: 'Creche', count: 4, capacity: 10 }, { service: 'Hotel', count: 0, capacity: 8 }, { service: 'DayUse', count: 3, capacity: undefined }]);
    expect(data.summary.distribution).toMatchObject({ counts: [2, 0, 0, 1], total: 3, unit: 'registros' });
    expect(data.summary.revenueSeries[0]).toMatchObject({ period: '2026-03', forecast: 2000, received: 1000 });
    expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer token');
});

it('mantém o dashboard disponível se a capacidade não puder ser carregada', async () => {
    const request = vi.fn(async url => url.includes('/calendario/dia') ? response({}, 500) : response(summary));
    const data = await createDashboardSource('http://localhost:8080', request, 'token').load();
    expect(data.summary.occupancy[0].capacity).toBeUndefined();
});

it('consulta e salva metas com a data exata e serviço do Swagger', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([{ idMeta: 8, mesReferencia: '2026-03-17', valor: 125, servico: { idServico: 2 } }])).mockResolvedValueOnce(response({}, 201));
    const source = createDashboardSource('http://localhost:8080', request, 'token');
    expect(await source.goals('2026-03-17', { id: '2', category: 'CRECHE' })).toEqual([{ id: '8', period: '2026-03-17', service: '2', cents: 12500 }]);
    expect(new URL(request.mock.calls[0][0]).searchParams.get('mesReferencia')).toBe('2026-03-17');
    await source.saveGoal('2026-03-17', '2', 125, '8');
    expect(request.mock.calls[1][0]).toBe('http://localhost:8080/dashboard/metas/8');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ mesReferencia: '2026-03-17', valor: 125, servico: { idServico: 2 } });
    const data = { serviceOptions: [{ id: '2' }], goals: [] };
    expect(validateDashboardForm('createGoal', { servico: '2', ano: '2026', mes: '03', 'data-referencia': '2026-04-17', valor: '125' }, data)['data-referencia']).toBeTruthy();
});

it('baixa somente a movimentação e o contrato retornados pelo servidor', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([{ id: 4, idContrato: 9, valor: 120, usuario: 'Ana', pet: 'Mel', servico: 'Creche' }])).mockResolvedValueOnce(response({}));
    const source = createDashboardSource('http://localhost:8080', request, 'token');
    const [row] = await source.pendingMovements();
    await source.payMovement(row, 'PIX', '2026-03-17');
    expect(request.mock.calls[1][0]).toBe('http://localhost:8080/dashboard/movimentacoes/4');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ formaPagamento: 'PIX', dataPagamento: '2026-03-17', contrato: { idContrato: 9 } });
});
