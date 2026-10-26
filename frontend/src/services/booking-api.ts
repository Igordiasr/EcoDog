import { IntegrationPending } from './api';
import { validISODate, validPeriod } from './dashboard-model';
import { requestJson, validateApiBaseUrl } from './http';
import type { TutorScheduleRecord } from './tutor-schedule';

export const bookingCategories = ['CRECHE', 'HOTEL', 'DAYUSE'] as const;
export type BookingCategory = typeof bookingCategories[number];
const labels = { CRECHE: 'Creche', HOTEL: 'Hotel', DAYUSE: 'DayUse' } as const;
export interface BookingService { id: string; name: string; category: BookingCategory; modality: string; frequency: string | null; cents: number }
export interface BookingAvailability { date: string; category: BookingCategory; capacity: number; remaining: number }
export interface BookingPet { id: string; name: string }
export interface BookingQuote { service: string; modality: string; petNames: string[]; dates: string[]; cents: number }
export interface BookingCreated { cents: number; awaitingApproval: boolean }
export interface DailyBookingRequest { idServico: number; idsPet: number[]; datasUtilizacao: string[] }
export const bookingIntegrationNotice = 'Agendamento indisponível: identidade/autorização (SEC-01), capacidade e concorrência (AGE-01/03) e preço (AGE-02) ainda dependem de validação do backend. Nenhuma reserva foi criada.';
export const cancellationIntegrationNotice = 'Cancelamento indisponível: a agenda não fornece ID de agendamento e a política financeira ainda depende de confirmação (AGE-05).';

function invalid(): never { throw new Error('Resposta inesperada do agendamento.'); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  return value as Record<string, unknown>;
}
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : invalid(); }
function text(value: unknown): string { return typeof value === 'string' && value.trim() ? value : invalid(); }
function id(value: unknown, max = Number.MAX_SAFE_INTEGER): string {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= max ? String(value) : invalid();
}
function count(value: unknown): number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : invalid(); }
function category(value: unknown): BookingCategory { return bookingCategories.includes(value as BookingCategory) ? value as BookingCategory : invalid(); }
function date(value: unknown): string { return typeof value === 'string' && validISODate(value) ? value : invalid(); }
function dates(value: unknown): string[] {
  const result = array(value).map(date);
  if (!result.length || new Set(result).size !== result.length) return invalid();
  return result;
}
// Decimal rounding without binary float multiplication (1.005 -> 101 cents).
export function bookingMoneyCents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return invalid();
  const [coefficient, exponentText] = String(value).toLowerCase().split('e');
  const [whole, fraction = ''] = coefficient.split('.');
  const digits = BigInt(whole + fraction);
  const power = Number(exponentText || 0) - fraction.length + 2;
  const divisor = power < 0 ? 10n ** BigInt(-power) : 1n;
  const cents = power >= 0 ? digits * 10n ** BigInt(power) : (digits + divisor / 2n) / divisor;
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) return invalid();
  return Number(cents);
}

export function parseBookingServices(body: unknown, expectedCategory: BookingCategory): BookingService[] {
  const ids = new Set<string>();
  return array(body).map(value => {
    const row = object(value), serviceId = id(row.id, 2147483647), serviceCategory = category(row.categoria);
    if (ids.has(serviceId) || serviceCategory !== expectedCategory) return invalid();
    ids.add(serviceId);
    if (!(row.frequencia == null || typeof row.frequencia === 'string')) return invalid();
    return { id: serviceId, name: text(row.nome), category: serviceCategory, modality: text(row.modalidade), frequency: row.frequencia ?? null, cents: bookingMoneyCents(row.valor) };
  });
}
export function parseBookingAvailability(body: unknown, expectedCategory: BookingCategory, period: string): BookingAvailability[] {
  if (!validPeriod(period)) return invalid();
  const seen = new Set<string>();
  return array(body).map(value => {
    const row = object(value), day = date(row.data), serviceCategory = category(row.categoriaServico);
    const capacity = count(row.capacidadeTotal), remaining = count(row.vagasDisponiveis);
    if (serviceCategory !== expectedCategory || !day.startsWith(`${period}-`) || seen.has(day) || remaining > capacity || capacity > 2147483647) return invalid();
    seen.add(day);
    return { date: day, category: serviceCategory, capacity, remaining };
  });
}
export function availabilityForGroup(rows: readonly BookingAvailability[] | null, serviceCategory: BookingCategory, selectedDates: readonly string[], petCount: number): 'unknown' | 'insufficient' | 'informative-only' {
  if (!rows || !selectedDates.length || !Number.isSafeInteger(petCount) || petCount <= 0) return 'unknown';
  const days = selectedDates.map(day => rows.find(row => row.date === day && row.category === serviceCategory));
  if (days.some(day => !day)) return 'unknown';
  return days.some(day => day!.remaining < petCount) ? 'insufficient' : 'informative-only';
}
export function parseBookingPets(body: unknown): BookingPet[] {
  const seen = new Set<string>();
  return array(body).map(value => {
    const row = object(value), petId = id(row.idPet);
    if (seen.has(petId)) return invalid();
    seen.add(petId);
    return { id: petId, name: text(row.nomePet) };
  });
}
// Read-only agenda. No ID, protocol or cancellation target is manufactured.
export function parseTutorSchedule(body: unknown, period: string): TutorScheduleRecord[] {
  if (!validPeriod(period)) return invalid();
  return array(body).map(value => {
    const row = object(value), day = date(row.data);
    if (!day.startsWith(`${period}-`)) return invalid();
    const rawCategory = row.servico;
    const service = bookingCategories.includes(rawCategory as BookingCategory) ? labels[rawCategory as BookingCategory] : null;
    const status = ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'].includes(row.situacaoAgendamento as string) ? row.situacaoAgendamento as string : null;
    return { petId: id(row.idPet), petName: text(row.nomePet), date: day, service, status, valid: service !== null && (status === 'AGENDADO' || status === 'CONFIRMADO') };
  });
}
export function parseBookingQuote(body: unknown): BookingQuote {
  const row = object(body), petNames = array(row.pets).map(text);
  if (!petNames.length) return invalid();
  const modality = text(row.modalidade);
  if (modality === 'PLANO') return invalid();
  return { service: text(row.servico), modality, petNames, dates: dates(row.datasUtilizacao), cents: bookingMoneyCents(row.valorTotal) };
}
export function parseBookingCreated(body: unknown): BookingCreated {
  const row = object(body);
  if (typeof row.aguardandoAprovacao !== 'boolean') return invalid();
  return { cents: bookingMoneyCents(row.valorTotal), awaitingApproval: row.aguardandoAprovacao };
}
export function bookingCreatedMessage(result: BookingCreated): string {
  return result.awaitingApproval ? 'Solicitação de agendamento recebida; aguardando aprovação.' : 'Agendamento registrado pelo sistema.';
}
// Pure draft validation only. It grants neither ownership nor permission to send.
export function buildDailyBookingRequest(service: BookingService, authorizedPets: readonly BookingPet[], selectedPetIds: readonly string[], selectedDates: readonly string[], approvedDailyModalities: readonly string[] = []): DailyBookingRequest {
  if (service.modality === 'PLANO' || !approvedDailyModalities.includes(service.modality) || !selectedPetIds.length || new Set(selectedPetIds).size !== selectedPetIds.length
    || selectedPetIds.some(petId => !authorizedPets.some(pet => pet.id === petId))) throw new IntegrationPending();
  const asNumber = (value: string, max: number) => {
    const number = Number(value);
    if (id(number, max) !== value) return invalid();
    return number;
  };
  return { idServico: asNumber(service.id, 2147483647), idsPet: selectedPetIds.map(value => asNumber(value, Number.MAX_SAFE_INTEGER)), datasUtilizacao: dates(selectedDates) };
}

export function createBookingApi(baseUrl: string, request: typeof fetch = fetch) {
  validateApiBaseUrl(baseUrl);
  return {
    async services(serviceCategory: BookingCategory, signal?: AbortSignal) {
      category(serviceCategory);
      return parseBookingServices(await requestJson(baseUrl, '/calendario/servicos', { query: { categoria: serviceCategory }, signal }, request), serviceCategory);
    },
    async availability(serviceCategory: BookingCategory, period: string, signal?: AbortSignal) {
      category(serviceCategory);
      if (!validPeriod(period)) return invalid();
      const [year, month] = period.split('-').map(Number);
      return parseBookingAvailability(await requestJson(baseUrl, '/calendario/disponibilidade', { query: { servico: serviceCategory, ano: year, mes: month }, signal }, request), serviceCategory, period);
    },
    // No protected transport contract exists. Supplying a frontend Session or ID
    // must not enable calls with credentials:'omit' or a presumed Bearer token.
    async pets(): Promise<BookingPet[]> { throw new IntegrationPending(); },
    async schedule(): Promise<TutorScheduleRecord[]> { throw new IntegrationPending(); },
    async quote(): Promise<BookingQuote> { throw new IntegrationPending(); },
    async book(): Promise<BookingCreated> { throw new IntegrationPending(); },
    async cancel(): Promise<never> { throw new Error(cancellationIntegrationNotice); },
  };
}
