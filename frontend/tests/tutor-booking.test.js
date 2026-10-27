import { expect, it } from 'vitest';
import { availableBookingDates, bookingBudget, bookingPets, matchingBookingService, saveTutorBooking } from '../src/api/tutor-booking';
const token = `header.${btoa(JSON.stringify({ sub: '4', roles: 'TUTOR', exp: 4102444800 }))}.signature`;
const session = { token, id: '4' };
it('associa os controles originais a um único serviço sem inventar uma escolha', () => {
    const services = [{ id: 1, categoria: 'CRECHE', modalidade: 'PLANO', frequencia: '3 vezes por semana' }, { id: 2, categoria: 'CRECHE', modalidade: 'PLANO', frequencia: '2 vezes por semana' }];
    expect(matchingBookingService(services, 'CRECHE', 3)?.id).toBe(1);
    expect(matchingBookingService(services, 'CRECHE', 4)).toBeNull();
    expect(matchingBookingService([{ id: 1, categoria: 'HOTEL' }, { id: 2, categoria: 'HOTEL' }], 'HOTEL', 0)).toBeNull();
});
it('bloqueia dias sem vagas ou com vagas insuficientes para todos os pets', () => {
    expect([...availableBookingDates([{ data: '2026-11-01', vagasDisponiveis: 0 }, { data: '2026-11-02', vagasDisponiveis: 1 }, { data: '2026-11-03', vagasDisponiveis: 2 }], 2, new Date('2026-11-01T12:00:00Z'))]).toEqual(['2026-11-03']);
});
it('bloqueia datas passadas mantendo hoje e datas futuras no fuso do backend', () => {
    const rows = ['2026-11-01', '2026-11-02', '2026-11-03'].map(data => ({ data, vagasDisponiveis: 5 }));
    expect([...availableBookingDates(rows, 1, new Date('2026-11-02T12:00:00Z'))]).toEqual(['2026-11-02', '2026-11-03']);
    expect([...availableBookingDates(rows, 1, new Date('2026-11-02T01:00:00Z'))]).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
});
it('consulta os pets autenticados do tutor', async () => {
    await expect(bookingPets('http://localhost:8080', session, undefined, async (url, options) => {
        expect(url).toContain('/calendario/pets?idUsuario=4');
        expect(options.headers.Authorization).toBe(`Bearer ${token}`);
        return new Response(JSON.stringify([{ idPet: 9, nomePet: 'Luna' }]));
    })).resolves.toEqual([{ idPet: 9, nome: 'Luna' }]);
});
it('consulta orçamento do plano sem criar agendamento nem calcular preço fictício', async () => {
    const result = await bookingBudget('http://localhost:8080', session, { id: 2, modalidade: 'PLANO' }, [9], ['2026-11-03'], undefined, async (url, options) => {
        expect(url).toContain('/calendario/orcamentos?idUsuario=4');
        expect(JSON.parse(options.body)).toEqual({ idServico: 2, idsPet: [9], datasUtilizacao: ['2026-11-03'], dataInicioPlano: '2026-11-03' });
        return new Response(JSON.stringify({ valorTotal: 630, datasUtilizacao: ['2026-11-03'] }));
    });
    expect(result.valorTotal).toBe(630);
});
it('salva as datas e pets identificados pelo endpoint existente', async () => {
    const result = await saveTutorBooking('http://localhost:8080', session, { id: 2, modalidade: 'DIARIA' }, [9], ['2026-11-03'], async (url, options) => {
        expect(url).toBe('http://localhost:8080/calendario/agendamentos?idUsuario=4');
        expect(options.method).toBe('POST');
        expect(options.headers.Authorization).toBe(`Bearer ${token}`);
        expect(JSON.parse(options.body)).toEqual({ idServico: 2, idsPet: [9], datasUtilizacao: ['2026-11-03'] });
        return new Response(JSON.stringify({ valorTotal: 120, aguardandoAprovacao: true }), { status: 201 });
    });
    expect(result.message).toContain('aguardando aprovação');
});
it('trata conflito e não confirma resposta de gravação inválida', async () => {
    await expect(saveTutorBooking('http://localhost:8080', session, { id: 2 }, [9], ['2026-11-03'], async () => new Response('{}', { status: 409 }))).rejects.toThrow(/Não foi possível agendar/);
    await expect(saveTutorBooking('http://localhost:8080', session, { id: 2 }, [9], ['2026-11-03'], async () => new Response('{}', { status: 201 }))).rejects.toThrow(/Confira seus agendamentos/);
});
