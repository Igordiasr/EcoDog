import { describe, expect, it, vi } from 'vitest';
import { createCalendarSource } from '../src/api/calendar-api';

const response = (body, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const day = { idCalendario: 1, data: '2026-11-15', vagasCreche: 10, vagasHotel: 7, atividades: [], alunosAgendados: [] };

describe('integração do gerenciamento de calendário', () => {
    it('consulta o mês e o dia selecionado com a sessão', async () => {
        const request = vi.fn().mockResolvedValueOnce(response(['2026-11-15'])).mockResolvedValueOnce(response(day));
        const source = createCalendarSource('http://localhost:8080', request, 'sessao');
        const data = await source.loadMonth('2026-11', '2026-11-15');
        expect(data.days[0].capacity).toEqual({ Creche: 10, Hotel: 7 });
        expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer sessao');
        expect(request.mock.calls[0][0]).toContain('/calendario/dias?mes=2026-11');
    });

    it('preserva as vagas do outro serviço ao atualizar', async () => {
        const request = vi.fn().mockResolvedValueOnce(response(day)).mockResolvedValueOnce(response(day));
        const source = createCalendarSource('http://localhost:8080', request, 'sessao');
        await source.apply({ kind: 'capacity', date: '2026-11-15', service: 'Creche', quantity: 12 });
        expect(request.mock.calls[1][1].method).toBe('PUT');
        expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ vagasCreche: 12, vagasHotel: 7 });
    });

    it('consulta o catálogo e programa e remove atividades', async () => {
        const request = vi.fn().mockResolvedValueOnce(response([{ idAtividade: 3, nome: 'Brincadeira' }])).mockResolvedValueOnce(response({}, 201)).mockResolvedValueOnce(response(null, 204));
        const source = createCalendarSource('http://localhost:8080', request, 'sessao');
        expect(await source.catalog()).toEqual([{ id: '3', name: 'Brincadeira' }]);
        await source.apply({ kind: 'activity', activity: { date: '2026-11-15', catalogId: '3', start: '09:00', end: '10:30' } });
        expect(JSON.parse(request.mock.calls[1][1].body)).toEqual({ idAtividade: 3, horaInicio: '09:00:00', horaFim: '10:30:00' });
        await source.apply({ kind: 'removeActivity', id: '14' });
        expect(request.mock.calls[2][0]).toBe('http://localhost:8080/calendario/atividades/14');
        expect(request.mock.calls[2][1].method).toBe('DELETE');
    });

    it('mantém a negativa de acesso e encerra sessões expiradas', async () => {
        const expired = vi.fn();
        const request = vi.fn().mockResolvedValueOnce(response({}, 403)).mockResolvedValueOnce(response({}, 401));
        const source = createCalendarSource('http://localhost:8080', request, 'sessao', expired);
        await expect(source.loadMonth('2026-11', '2026-11-15')).rejects.toMatchObject({ status: 403 });
        await expect(source.catalog()).rejects.toMatchObject({ status: 401 });
        expect(expired).toHaveBeenCalledOnce();
    });
});
