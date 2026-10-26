import { describe, expect, it, vi } from 'vitest';
import { availabilityForGroup, bookingCreatedMessage, bookingMoneyCents, buildDailyBookingRequest, createBookingApi, parseBookingAvailability, parseBookingCreated, parseBookingPets, parseBookingQuote, parseBookingServices, parseTutorSchedule } from '../src/services/booking-api';
import { IntegrationPending } from '../src/services/api';

const base = 'http://localhost:8080';
const service = { id: 17, nome: 'Serviço de teste', categoria: 'HOTEL', modalidade: 'MODALIDADE_TESTE', frequencia: null, valor: 1.005 };
const day = { data: '2026-10-27', categoriaServico: 'HOTEL', capacidadeTotal: 3, vagasDisponiveis: 2 };
const respond = (body: unknown, status = 200) => vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('leituras públicas de agendamento', () => {
  it('usa categorias e ID real do serviço, preserva modalidade/frequência e centavos', async () => {
    const request = respond([service]);
    const signal = new AbortController().signal;
    expect(await createBookingApi(base, request).services('HOTEL', signal)).toEqual([{ id: '17', name: service.nome, category: 'HOTEL', modality: service.modalidade, frequency: null, cents: 101 }]);
    expect(request).toHaveBeenCalledWith(`${base}/calendario/servicos?categoria=HOTEL`, { method: 'GET', signal, credentials: 'omit', headers: { Accept: 'application/json' } });
  });
  it('serializa período civil e categoria sem IDs de design', async () => {
    const request = respond([day]);
    const signal = new AbortController().signal;
    expect(await createBookingApi(base, request).availability('HOTEL', '2026-10', signal)).toEqual([{ date: day.data, category: 'HOTEL', capacity: 3, remaining: 2 }]);
    expect(request.mock.calls[0][0]).toBe(`${base}/calendario/disponibilidade?servico=HOTEL&ano=2026&mes=10`);
    expect(request.mock.calls[0][1]?.signal).toBe(signal);
  });
  it('distingue ausência de contagem, zero e capacidade para todos os pets', () => {
    const rows = parseBookingAvailability([day], 'HOTEL', '2026-10');
    expect(availabilityForGroup(rows, 'HOTEL', [day.data], 2)).toBe('informative-only');
    expect(availabilityForGroup(rows, 'HOTEL', [day.data], 3)).toBe('insufficient');
    expect(availabilityForGroup(rows, 'HOTEL', ['2026-10-28'], 1)).toBe('unknown');
    expect(availabilityForGroup([], 'HOTEL', [day.data], 1)).toBe('unknown');
    expect(availabilityForGroup(null, 'HOTEL', [day.data], 1)).toBe('unknown');
    expect(parseBookingAvailability([{ ...day, vagasDisponiveis: 0 }], 'HOTEL', '2026-10')[0].remaining).toBe(0);
  });
  it.each([{ ...day, data: '2026-02-30' }, { ...day, data: '2026-11-01' }, { ...day, categoriaServico: 'CRECHE' }, { ...day, vagasDisponiveis: 4 }, { ...day, capacidadeTotal: -1 }, { ...day, vagasDisponiveis: undefined }])('rejeita disponibilidade inválida %j', row => {
    expect(() => parseBookingAvailability([row], 'HOTEL', '2026-10')).toThrow('Resposta inesperada');
  });
  it.each([{}, [null], [service, service], [{ ...service, id: '17' }], [{ ...service, id: 2147483648 }], [{ ...service, categoria: 'DESCONHECIDA' }], [{ ...service, valor: undefined }]])('rejeita serviços incompatíveis %j', body => {
    expect(() => parseBookingServices(body, 'HOTEL')).toThrow('Resposta inesperada');
  });
  it('preserva vazio válido; rejeita 204 e erros sem fallback', async () => {
    expect(await createBookingApi(base, respond([])).services('HOTEL')).toEqual([]);
    const noContent = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    await expect(createBookingApi(base, noContent).availability('HOTEL', '2026-10')).rejects.toThrow('Resposta inesperada');
    for (const status of [400, 403, 404, 409, 500]) await expect(createBookingApi(base, respond({ message: 'SQL privado' }, status)).services('HOTEL')).rejects.toMatchObject({ status });
    const network = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'));
    await expect(createBookingApi(base, network).services('HOTEL')).rejects.toBeInstanceOf(TypeError);
  });
  it('valida configuração/período antes de consultar', async () => {
    expect(() => createBookingApi(`${base}?token=secret`)).toThrow();
    const request = respond([]);
    await expect(createBookingApi(base, request).availability('HOTEL', '2026-13')).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });
});

describe('DTOs e gates protegidos', () => {
  it('nenhum método protegido dispara fetch ou presume credenciais', async () => {
    const request = respond([]), api = createBookingApi(base, request);
    for (const operation of [api.pets, api.schedule, api.quote, api.book]) await expect(operation()).rejects.toBeInstanceOf(IntegrationPending);
    await expect(api.cancel()).rejects.toThrow('AGE-05');
    expect(request).not.toHaveBeenCalled();
  });
  it('valida IDs seguros e distintos dos pets', () => {
    expect(parseBookingPets([{ idPet: 19, nomePet: 'Pet do DTO' }])).toEqual([{ id: '19', name: 'Pet do DTO' }]);
    for (const idPet of [0, -1, 1.1, '19', Number.MAX_SAFE_INTEGER + 1]) expect(() => parseBookingPets([{ idPet, nomePet: 'Pet' }])).toThrow();
    expect(() => parseBookingPets([{ idPet: 19, nomePet: 'Pet' }, { idPet: 19, nomePet: 'Pet' }])).toThrow();
  });
  it('agenda de leitura não fabrica ID de reserva; enum desconhecido torna linha inativa', () => {
    const row = { data: day.data, idPet: 19, nomePet: 'Pet', servico: 'CRECHE', situacaoAgendamento: 'AGENDADO' };
    expect(parseTutorSchedule([row], '2026-10')[0]).toEqual({ petId: '19', petName: 'Pet', service: 'Creche', status: 'AGENDADO', date: day.data, valid: true });
    expect(parseTutorSchedule([{ ...row, situacaoAgendamento: 'NOVO' }], '2026-10')[0].valid).toBe(false);
    expect(parseTutorSchedule([{ ...row, servico: 'NOVO' }], '2026-10')[0].valid).toBe(false);
    expect(() => parseTutorSchedule([row], '2026-11')).toThrow();
  });
  it('payload diário contém apenas IDs e datas; modalidade exige regra explicitamente aprovada', () => {
    const normalized = parseBookingServices([service], 'HOTEL')[0];
    const pets = [{ id: '19', name: 'Pet' }];
    const build = (ids: string[], selectedDates = [day.data], modality = service.modalidade) => buildDailyBookingRequest({ ...normalized, modality }, pets, ids, selectedDates, [service.modalidade]);
    expect(build(['19'])).toEqual({ idServico: 17, idsPet: [19], datasUtilizacao: [day.data] });
    expect(() => build(['20'])).toThrow();
    expect(() => build(['19', '19'])).toThrow();
    expect(() => build(['19'], [day.data, day.data])).toThrow();
    expect(() => build(['19'], ['2026-02-30'])).toThrow();
    expect(() => build(['19'], [day.data], 'PLANO')).toThrow();
    expect(() => build(['19'], [day.data], 'DESCONHECIDA')).toThrow();
    expect(() => buildDailyBookingRequest(normalized, pets, ['19'], [day.data])).toThrow(IntegrationPending);
  });
  it('orçamento usa valor do servidor e reserva não inventa protocolo ou confirmação de aprovação', () => {
    expect(parseBookingQuote({ servico: 'Serviço', modalidade: service.modalidade, pets: ['Pet'], datasUtilizacao: [day.data], valorTotal: 12.34 })).toEqual({ service: 'Serviço', modality: service.modalidade, petNames: ['Pet'], dates: [day.data], cents: 1234 });
    const result = parseBookingCreated({ valorTotal: 0, aguardandoAprovacao: true });
    expect(result).toEqual({ cents: 0, awaitingApproval: true });
    expect(bookingCreatedMessage(result)).toContain('aguardando aprovação');
    expect(() => parseBookingCreated({ valorTotal: 10 })).toThrow();
    expect(() => parseBookingQuote({ servico: 'Plano', modalidade: 'PLANO', pets: ['Pet'], datasUtilizacao: [day.data], valorTotal: 10 })).toThrow();
  });
  it('conversão decimal é controlada e rejeita ausência/valores inseguros', () => {
    expect(bookingMoneyCents(1.005)).toBe(101);
    expect(bookingMoneyCents(1e-7)).toBe(0);
    expect(bookingMoneyCents(0)).toBe(0);
    for (const value of [undefined, null, '10', -1, Infinity, NaN, Number.MAX_VALUE]) expect(() => bookingMoneyCents(value)).toThrow();
  });
});
