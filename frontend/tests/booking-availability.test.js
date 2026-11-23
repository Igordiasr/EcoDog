import { describe, expect, it, vi } from 'vitest';
import { loadBookingAvailability } from '../src/api/booking-availability';
import { availableBookingDates } from '../src/api/tutor-booking';

describe('Consulta de disponibilidade', () => {
    it('consulta por GET e libera somente datas futuras com vagas', async () => {
        const rows = [
            { data: '2026-11-22', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 4 },
            { data: '2026-11-23', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 2 },
            { data: '2026-11-24', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 0 },
        ];
        const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(rows), { status: 200 }));
        const data = await loadBookingAvailability('http://localhost:8080', 'HOTEL', 2026, 11, undefined, request, 'tutor-token');
        expect(request.mock.calls[0][0]).toBe('http://localhost:8080/calendario/disponibilidade?servico=HOTEL&ano=2026&mes=11');
        expect(request.mock.calls[0][1].method).toBe('GET');
        expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer tutor-token');
        expect([...availableBookingDates(data, 1, new Date('2026-11-23T12:00:00Z'))]).toEqual(['2026-11-23']);
    });

    it('não interpreta acesso negado como uma lista sem vagas', async () => {
        const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }));
        await expect(loadBookingAvailability('http://localhost:8080', 'HOTEL', 2026, 11, undefined, request))
            .rejects.toMatchObject({ status: 403 });
    });
});
