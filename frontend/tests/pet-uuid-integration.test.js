import { expect, it, vi } from 'vitest';
import { isUuid, uuid, positiveId } from '../src/models/integration-contracts';
import { loadTutorPets } from '../src/models/tutor-pets';
import { registerTutorPet } from '../src/models/pet-registration';
import { deleteTutorPet } from '../src/api/pets-api';
import { bookingPets, bookingBudget, saveTutorBooking } from '../src/api/tutor-booking';
import { createPresenceApi } from '../src/api/presence-api';
import { createPetDiaryApi } from '../src/api/pet-diary-api';
import { createCalendarSource } from '../src/api/calendar-api';
import { loadCurrentUser } from '../src/models/current-user';
import { createAuthApi, sessionFromToken } from '../src/models/auth';

const tutorId = '550e8400-e29b-41d4-a716-446655440000';
const petId = '550e8400-e29b-41d4-a716-446655440001';
const token = `header.${btoa(JSON.stringify({ sub: tutorId, roles: 'TUTOR', exp: Math.floor(Date.now() / 1000) + 600 }))}.signature`;
const session = { token, id: tutorId, profile: 'tutor' };
const base = 'http://localhost:8080';
const response = body => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

it('distingue UUIDs de IDs numéricos sem converter o contrato inteiro', () => {
    expect(isUuid(petId)).toBe(true);
    expect(isUuid(1)).toBe(false);
    expect(() => uuid('NaN', 'pet')).toThrow();
    expect(() => uuid('1', 'pet')).toThrow();
    expect(positiveId(12, 'participação')).toBe(12);
    expect(() => positiveId(petId, 'participação')).toThrow();
});
it('lista e exclui pets na rota atual de tutores com UUIDs e autenticação', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([{ idPet: petId, nome: 'Mel' }])).mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect((await loadTutorPets(base, session, undefined, request))[0].idPet).toBe(petId);
    await deleteTutorPet(base, session, petId, request);
    expect(request.mock.calls[0][0]).toBe(`${base}/tutores/${tutorId}/pets`);
    expect(request.mock.calls[1][0]).toBe(`${base}/tutores/${tutorId}/pets/${petId}`);
    expect(request.mock.calls[1][1].headers.Authorization).toBe(`Bearer ${token}`);
    expect(request.mock.calls[1][1].method).toBe('DELETE');
});
it('cadastra pet e aceita UUID retornado pelo backend', async () => {
    const request = vi.fn().mockResolvedValue(response({ idPet: petId }));
    const result = await registerTutorPet(base, session, { nome: 'Mel', sexo: 'F', raca: 'SRD', castrado: 'Sim', nascimento: '2020-01-01', obs: 'Saudável', 'relacionamento-com-outros-pets': 'Sociável', veterinario: 'Ana', contato: '(11) 91234-5678', convenio: 'Não' }, undefined, request);
    expect(result.idPet).toBe(petId);
    expect(request.mock.calls[0][0]).toBe(`${base}/tutores/${tutorId}/pets`);
    expect(JSON.parse(request.mock.calls[0][1].body).telefoneVeterinario).toBe('11912345678');
});
it('envia UUIDs intactos no orçamento e no agendamento, mantendo serviço numérico', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([{ idPet: petId, nomePet: 'Mel' }])).mockResolvedValueOnce(response({ valorTotal: 100, datasUtilizacao: ['2026-12-01'] })).mockResolvedValueOnce(response({ valorTotal: 100, aguardandoAprovacao: false }));
    const service = { id: 2, modalidade: 'AVULSO' };
    expect((await bookingPets(base, session, undefined, request))[0].idPet).toBe(petId);
    await bookingBudget(base, session, service, [petId], ['2026-12-01'], undefined, request);
    await saveTutorBooking(base, session, service, [petId], ['2026-12-01'], request);
    for (const [, options] of request.mock.calls.slice(1)) expect(JSON.parse(options.body)).toEqual({ idServico: 2, idsPet: [petId], datasUtilizacao: ['2026-12-01'] });
    await expect(saveTutorBooking(base, session, service, [1], ['2026-12-01'], request)).rejects.toThrow();
});
it('consulta presença com UUID do pet e faz check-in pelo agendamento numérico', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([{ idPet: petId, idAgendamento: 8, nomePet: 'Mel', situacao: 'AGENDADO' }])).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const api = createPresenceApi(base, request, token);
    expect((await api.list('2026-11-19'))[0].idPet).toBe(petId);
    await api.checkIn(8, 'Ana');
    expect(request.mock.calls[1][0]).toBe(`${base}/checkin-checkout/8/check-in`);
});
it('consulta diário por UUID e rejeita retorno de outro pet', async () => {
    const data = { idPet: petId, data: '2026-11-19', resumo: {}, atividades: [], medicacoes: [] };
    const request = vi.fn().mockResolvedValueOnce(response(data)).mockResolvedValueOnce(response({ ...data, idPet: tutorId }));
    const api = createPetDiaryApi(base, request, token);
    expect((await api.day(petId, data.data)).idPet).toBe(petId);
    expect(request.mock.calls[0][0]).toBe(`${base}/api/diario/${petId}?data=2026-11-19`);
    await expect(api.historyDay(petId, data.data)).rejects.toThrow('diferente');
});
it('calendário administrativo aceita aluno com UUID e agendamento numérico', async () => {
    const request = vi.fn().mockResolvedValueOnce(response(['2026-11-19'])).mockResolvedValueOnce(response({ data: '2026-11-19', idCalendario: 1, vagasCreche: 10, vagasHotel: 10, atividades: [], alunosAgendados: [{ idPet: petId, idAgendamento: 8, nome: 'Mel', idade: 6, situacao: 'AGENDADO' }] }));
    const result = await createCalendarSource(base, request).loadMonth('2026-11');
    expect(result.students[0]).toMatchObject({ petId, id: '8' });
});
it('consulta identidade do tutor em conta usando idTutor UUID', async () => {
    const request = vi.fn().mockResolvedValue(response({ idTutor: tutorId, nome: 'Ana' }));
    expect((await loadCurrentUser(base, session, undefined, request)).nome).toBe('Ana');
    expect(request.mock.calls[0][0]).toBe(`${base}/tutores/conta/${tutorId}`);
});
it('autentica pela rota atual e rejeita subject numérico legado', async () => {
    const request = vi.fn().mockResolvedValue(response({ token }));
    const api = createAuthApi(base, { request, storage: { setItem: vi.fn() } });
    expect((await api.login('ana@example.com', 'Senha123')).id).toBe(tutorId);
    expect(request.mock.calls[0][0]).toBe(`${base}/auth/login`);
    const legacy = `header.${btoa(JSON.stringify({ sub: '1', roles: 'TUTOR', exp: Math.floor(Date.now() / 1000) + 600 }))}.signature`;
    expect(sessionFromToken(legacy)).toBeNull();
});
