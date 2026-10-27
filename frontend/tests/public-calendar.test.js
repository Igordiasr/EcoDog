import { expect, it, vi } from 'vitest';
import { loadBookingAvailability } from '../src/api/booking-availability';
import { availableBookingDates } from '../src/api/tutor-booking';

it('consults public monthly availability and exposes only selectable dates', async () => {
    const request = vi.fn(async () => new Response(JSON.stringify([
        { data: '2026-10-28', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 1 },
        { data: '2026-10-29', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 0 },
        { data: '2026-10-30', categoriaServico: 'HOTEL', capacidadeTotal: 10, vagasDisponiveis: 5 },
    ]), { status: 200 }));
    const rows = await loadBookingAvailability('http://localhost:8080', 'HOTEL', 2026, 10, undefined, request);
    expect(request.mock.calls[0][0]).toBe('http://localhost:8080/calendario/disponibilidade?servico=HOTEL&ano=2026&mes=10');
    expect([...availableBookingDates(rows, 1, new Date('2026-10-27T12:00:00Z'))]).toEqual(['2026-10-28', '2026-10-30']);
});
