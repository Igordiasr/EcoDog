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

    it('lê alunos pendentes do dia usando os campos do contrato existente', async () => {
        const student = { idAgendamento: 15, idPet: '550e8400-e29b-41d4-a716-446655440000', nome: 'Mel', raca: 'SRD', idade: 2, tutor: 'Ana', situacao: 'PENDENTE' };
        const request = vi.fn().mockResolvedValueOnce(response([])).mockResolvedValueOnce(response({ ...day, alunosAgendados: [student] }));
        const data = await createCalendarSource('http://localhost:8080', request, 'sessao').loadMonth('2026-11', '2026-11-15');
        expect(data.students).toEqual([{ id: '15', petId: student.idPet, date: '2026-11-15', name: 'Mel', breed: 'SRD', age: 2, tutor: 'Ana', status: 'PENDENTE' }]);
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

    it('cancela pelo identificador do agendamento, com a sessão e o corpo esperados', async () => {
        const request = vi.fn().mockResolvedValueOnce(response({ mensagem: 'Agendamento cancelado.' }));
        const source = createCalendarSource('http://localhost:8080', request, 'sessao');
        await source.apply({ kind: 'cancelBooking', id: '15', date: '2026-11-15' });
        expect(request.mock.calls[0][0]).toBe('http://localhost:8080/calendario/agendamentos/15');
        expect(request.mock.calls[0][1].method).toBe('PATCH');
        expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer sessao');
        expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ situacao: 'CANCELADO' });
    });

    it('rejeita identificadores inválidos antes de enviar o cancelamento', async () => {
        const request = vi.fn();
        const source = createCalendarSource('http://localhost:8080', request, 'sessao');
        await expect(source.apply({ kind: 'cancelBooking', id: '../outro', date: '2026-11-15' })).rejects.toThrow();
        expect(request).not.toHaveBeenCalled();
    });
});
