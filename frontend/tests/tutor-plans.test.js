import { expect, it, vi } from 'vitest';
import { loadTutorPlans } from '../src/api/tutor-plans-api';

const id = '550e8400-e29b-41d4-a716-446655440000';
const pet = '550e8400-e29b-41d4-a716-446655440001';
const token = `header.${btoa(JSON.stringify({ sub: id, roles: 'TUTOR', exp: Math.floor(Date.now() / 1000) + 600 }))}.signature`;
const session = { token, id };
const base = 'http://localhost:8080';
const response = body => new Response(JSON.stringify(body), { status: 200 });
const hotel = { idPet: pet, nomePet: 'Mel', servico: 'HOTEL', quantidadeDias: 2, diasDaSemana: null, diasAgendados: ['2026-12-02', '2026-12-01'] };

it('consulta planos na rota atual com UUID, autenticação e cancelamento', async () => {
    const request = vi.fn().mockResolvedValue(response([hotel, { ...hotel, servico: 'CRECHE', diasDaSemana: ['SEGUNDA', 'QUARTA'] }]));
    const signal = new AbortController().signal;
    const plans = await loadTutorPlans(base, session, signal, request);
    expect(request.mock.calls[0][0]).toBe(`${base}/tutores/${id}/agendamentos`);
    expect(request.mock.calls[0][1]).toMatchObject({ method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal });
    expect(plans[0].diasDaSemana).toEqual([]);
    expect(plans[0].diasAgendados).toEqual(['2026-12-01', '2026-12-02']);
    expect(plans[1].diasDaSemana).toEqual(['SEGUNDA', 'QUARTA']);
});
it('aceita lista vazia e rejeita sessão divergente antes da requisição', async () => {
    const request = vi.fn().mockResolvedValue(response([]));
    expect(await loadTutorPlans(base, session, undefined, request)).toEqual([]);
    request.mockClear();
    await expect(loadTutorPlans(base, { ...session, id: pet }, undefined, request)).rejects.toThrow('sessão');
    expect(request).not.toHaveBeenCalled();
});
it('exibe todas as categorias e pets retornados sem descartar Day Use ou itens repetidos', async () => {
    const anotherPet = '550e8400-e29b-41d4-a716-446655440002';
    const items = [hotel, { ...hotel, servico: 'DAYUSE' }, { ...hotel, servico: 'CRECHE', diasDaSemana: ['SEXTA'] }, { ...hotel, idPet: anotherPet, nomePet: 'Thor', servico: 'DAYUSE' }, hotel];
    const plans = await loadTutorPlans(base, session, undefined, vi.fn().mockResolvedValue(response(items)));
    expect(plans).toHaveLength(items.length);
    expect(plans.map(plan => plan.servico)).toEqual(['HOTEL', 'DAYUSE', 'CRECHE', 'DAYUSE', 'HOTEL']);
    expect(plans[3]).toMatchObject({ idPet: anotherPet, nomePet: 'Thor' });
});
it('rejeita contratos inválidos e propaga falhas HTTP', async () => {
    for (const invalid of [null, { ...hotel, idPet: 1 }, { ...hotel, quantidadeDias: -1 }, { ...hotel, diasAgendados: ['2026-02-30'] }, { ...hotel, diasDaSemana: ['MONDAY'] }]) {
        await expect(loadTutorPlans(base, session, undefined, vi.fn().mockResolvedValue(response([invalid])))).rejects.toThrow();
    }
    await expect(loadTutorPlans(base, session, undefined, vi.fn().mockResolvedValue(new Response('{}', { status: 403 })))).rejects.toThrow('Acesso negado');
});
