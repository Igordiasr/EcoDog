import type { CalendarActivity, CalendarBooking, CalendarCatalogItem, CalendarCommand, CalendarData, CalendarSource } from './calendar-model';
import { timeRangeError } from './calendar-model';
import { validISODate, validPeriod } from './dashboard-model';
import type { JsonRequest } from './http';

export const calendarGateNotice = 'Calendário administrativo indisponível: autorização de administrador (SEC-01) ainda não validada.';
function invalid(): never { throw new Error('Resposta inesperada do calendário.'); }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : invalid(); }
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : invalid(); }
function id(value: unknown): string { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? String(value) : invalid(); }
function count(value: unknown): number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 2147483647 ? value : invalid(); }
function text(value: unknown): string { return typeof value === 'string' && value.trim() ? value : invalid(); }
function optionalText(value: unknown): string | undefined { return value == null ? undefined : text(value); }
function time(value: unknown): string { return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value) ? value.slice(0, 5) : invalid(); }
function unique<T>(rows: T[], key: (row: T) => string): T[] { return new Set(rows.map(key)).size === rows.length ? rows : invalid(); }
export function parseCalendarDates(body: unknown, period: string): string[] {
  if (!validPeriod(period)) return invalid();
  return unique(array(body).map(value => typeof value === 'string' && validISODate(value) && value.slice(0, 7) === period ? value : invalid()), value => value);
}
export function parseCalendarCatalog(body: unknown): CalendarCatalogItem[] {
  return unique(array(body).map(value => { const row = object(value); if (row.idAtividadeDoDia !== null || row.horaInicio !== null || row.horaFim !== null) return invalid(); return { id: id(row.idAtividade), name: text(row.nome) }; }), row => row.id);
}
export function parseCalendarActivity(body: unknown, date: string): CalendarActivity {
  const row = object(body), start = time(row.horaInicio), end = time(row.horaFim);
  if (!validISODate(date) || timeRangeError(start, end)) return invalid();
  return { id: id(row.idAtividadeDoDia), catalogId: id(row.idAtividade), date, name: text(row.nome), start, end };
}
export function parseCalendarDay(body: unknown, expectedDate: string): CalendarData {
  const row = object(body);
  if (!validISODate(expectedDate) || row.data !== expectedDate) return invalid();
  const calendarId = row.idCalendario === null ? null : id(row.idCalendario);
  const creche = count(row.vagasCreche), hotel = count(row.vagasHotel);
  const activities = unique(array(row.atividades).map(value => parseCalendarActivity(value, expectedDate)), value => value.id);
  if (calendarId === null && (creche !== 0 || hotel !== 0 || activities.length)) return invalid();
  const statuses = { AGENDADO: 'pending', CONFIRMADO: 'confirmed', RETIRADO: 'withdrawn', CANCELADO: 'cancelled' } as const;
  const bookings = unique(array(row.alunosAgendados).map(value => {
    const aluno = object(value), status = statuses[aluno.situacao as keyof typeof statuses];
    if (!status) return invalid();
    return { id: id(aluno.idAgendamento), petId: id(aluno.idPet), petName: text(aluno.nome), date: expectedDate, breed: optionalText(aluno.raca), tutor: optionalText(aluno.tutor), age: aluno.idade == null ? undefined : count(aluno.idade), status } satisfies CalendarBooking;
  }), value => value.id);
  return { days: [{ date: expectedDate, calendarId, configured: calendarId !== null, capacity: calendarId === null ? {} : { Creche: creche, Hotel: hotel } }], activities, bookings, occupancyKnown: false };
}

// Production remains blocked. No cookie/token contract or permission is invented.
export const blockedCalendarSource: CalendarSource = {
  capabilities: { capacity: false, monthCapacity: false, availability: false, activity: false, removeActivity: false, cancelBooking: false, editActivity: false },
  async loadMonth() { throw new Error(calendarGateNotice); },
  async apply() { throw new Error(calendarGateNotice); },
};
export type CalendarContractTransport = (path: string, options: JsonRequest) => Promise<unknown>;
export function calendarCapacityRequest(date: string, service: 'Creche' | 'Hotel', quantity: number, data: CalendarData): { path: string; options: JsonRequest } {
  if (!validISODate(date)) return invalid();
  const current = data.days.find(row => row.date === date);
  const other = current?.capacity[service === 'Creche' ? 'Hotel' : 'Creche'];
  if (!current?.configured || other === undefined) throw new Error('Consulte os valores reais dos dois serviços antes de preparar a alteração.');
  const body = { vagasCreche: service === 'Creche' ? count(quantity) : count(other), vagasHotel: service === 'Hotel' ? count(quantity) : count(other) };
  return { path: `/calendario/${date}/vagas`, options: { method: 'PUT', body } };
}
// Contract preparation for injected, independently authorized transports/fixtures.
// Not wired to fetch or enabled in App while SEC-01 and concurrency are pending.
export function prepareCalendarSource(transport: CalendarContractTransport): CalendarSource {
  return {
    capabilities: { ...blockedCalendarSource.capabilities },
    activityConflict: () => true,
    async loadMonth(period, signal, selectedDate) {
      if (!validPeriod(period) || selectedDate && (!validISODate(selectedDate) || selectedDate.slice(0, 7) !== period)) return invalid();
      const dates = parseCalendarDates(await transport('/calendario/dias', { query: { mes: period }, signal }), period);
      if (selectedDate && !dates.includes(selectedDate)) dates.push(selectedDate);
      const result: CalendarData = { days: [], activities: [], bookings: [], occupancyKnown: false };
      let cursor = 0;
      await Promise.all(Array.from({ length: Math.min(4, dates.length) }, async () => {
        while (cursor < dates.length) {
          signal?.throwIfAborted();
          const date = dates[cursor++];
          const day = parseCalendarDay(await transport('/calendario/dia', { query: { data: date }, signal }), date);
          result.days.push(...day.days); result.activities.push(...day.activities); result.bookings.push(...day.bookings);
        }
      }));
      result.catalog = parseCalendarCatalog(await transport('/calendario/catalogo-atividades', { signal }));
      signal?.throwIfAborted();
      result.days.sort((a, b) => a.date.localeCompare(b.date));
      return result;
    },
    async apply() { throw new Error('Escrita indisponível: autorização e concorrência ainda não validadas.'); },
  };
}
// Pure payload/route preparation: cannot authorize or perform a write.
export function calendarActivityRequest(command: CalendarCommand, data: CalendarData): { path: string; options: JsonRequest } {
  if (command.kind === 'removeActivity') {
    if (!validISODate(command.date) || !data.activities.some(row => row.id === command.id && row.date === command.date) || !/^[1-9]\d*$/.test(command.id)) return invalid();
    return { path: `/calendario/atividades/${command.id}`, options: { method: 'DELETE' } };
  }
  if (command.kind !== 'activity') throw new Error('Operação sem contrato liberado.');
  const activity = command.activity, catalog = data.catalog?.find(row => row.id === activity.catalogId);
  if (data.activities.some(row => row.id === activity.id)) throw new Error('Edição de atividade indisponível.');
  if (!catalog || !validISODate(activity.date) || timeRangeError(activity.start, activity.end)) return invalid();
  const catalogId = Number(catalog.id);
  if (!Number.isSafeInteger(catalogId) || catalogId <= 0 || catalogId > 2147483647) return invalid();
  return { path: `/calendario/${activity.date}/atividades`, options: { method: 'POST', body: { idAtividade: catalogId, horaInicio: activity.start, horaFim: activity.end } } };
}
