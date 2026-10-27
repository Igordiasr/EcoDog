import { describe, expect, it, vi } from 'vitest';
import { createCalendarSource } from '../src/api/calendar-api';
const day = (date, configured = true) => ({ idCalendario: configured ? 2 : null, data: date, vagasCreche: configured ? 3 : 0, vagasHotel: configured ? 5 : 0, atividades: [], alunosAgendados: [] });
const mock = (routes) => vi.fn(async (url) => {
    const u = new URL(String(url));
    const key = `${u.pathname}?${u.searchParams.toString()}`;
    return { ok: true, status: 200, json: async () => routes[key] };
});
describe('SPEC-02 calendar read adapter', () => {
    it('loads configured days plus selected unconfigured date without inventing availability', async () => {
        const source = createCalendarSource('http://localhost:8080', mock({
            '/calendario/dias?mes=2026-10': ['2026-10-01'],
            '/calendario/dia?data=2026-10-01': day('2026-10-01'),
            '/calendario/dia?data=2026-10-02': day('2026-10-02', false),
        }));
        const result = await source.loadMonth('2026-10', '2026-10-02');
        expect(result.days).toHaveLength(2);
        expect(result.days[1].available).toBeUndefined();
        expect(result.days[1].capacity).toEqual({});
        expect(source.apply).toBeUndefined();
    });
    it('preserves four distinct student states without inventing service or time', async () => {
        const rows = ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'].map((status, i) => ({ idAgendamento: i + 1, idPet: 7, nome: 'Bidu', raca: null, idade: 2, tutor: 'Maria', situacao: status }));
        const source = createCalendarSource('http://localhost:8080', mock({ '/calendario/dias?mes=2026-10': ['2026-10-01'], '/calendario/dia?data=2026-10-01': { ...day('2026-10-01'), alunosAgendados: rows } }));
        const result = await source.loadMonth('2026-10');
        expect(result.students?.map(x => x.status)).toEqual(['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO']);
        expect(result.bookings).toEqual([]);
    });
    it('rejects invalid day payload instead of converting it into empty data', async () => {
        const source = createCalendarSource('http://localhost:8080', mock({ '/calendario/dias?mes=2026-10': ['2026-10-01'], '/calendario/dia?data=2026-10-01': { ...day('2026-10-01'), atividades: null } }));
        await expect(source.loadMonth('2026-10')).rejects.toThrow(/atividades/);
    });
});
