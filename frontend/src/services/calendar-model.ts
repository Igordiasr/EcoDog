import { dateKey, validISODate, validPeriod } from './dashboard-model';

// Frontend presentation model. These are not database fields or HTTP responses.
export type CalendarService = 'Creche' | 'Hotel';
export interface CalendarConfiguration { date: string; configured?: boolean; calendarId?: string | null; available?: boolean; capacity: Partial<Record<CalendarService, number>> }
export interface CalendarActivity { id: string; catalogId?: string; date: string; name: string; start?: string; end?: string }
export interface CalendarBooking {
  id: string; date: string; service?: CalendarService; petId: string; petName: string;
  breed?: string; birthDate?: string; age?: number; tutor?: string; start?: string; end?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'withdrawn';
}
export interface CalendarCatalogItem { id: string; name: string }
export interface CalendarData { days: CalendarConfiguration[]; activities: CalendarActivity[]; bookings: CalendarBooking[]; catalog?: CalendarCatalogItem[]; occupancyKnown?: boolean }
export type CalendarCommand =
  | { kind: 'capacity'; date: string; service: CalendarService; quantity: number }
  | { kind: 'monthCapacity'; period: string; service: CalendarService; quantity: number }
  | { kind: 'availability'; date: string; available: boolean }
  | { kind: 'activity'; activity: CalendarActivity }
  | { kind: 'removeActivity'; id: string; date: string }
  | { kind: 'cancelBooking'; id: string; date: string };
export interface CalendarPolicy {
  activityConflict?(a: CalendarActivity, b: CalendarActivity): boolean;
  cancellationError?(booking: CalendarBooking): string | null;
}
export interface CalendarSource extends CalendarPolicy {
  capabilities?: Partial<Record<CalendarCommand['kind'] | 'editActivity', boolean>>;
  loadMonth(period: string, signal?: AbortSignal, selectedDate?: string): Promise<CalendarData>;
  // Adapter-level frontend command; map only to confirmed backend contracts.
  // Month operations must be atomic, not a loop of independent HTTP saves.
  apply?(command: CalendarCommand): Promise<void>;
}
export const emptyCalendarData = (): CalendarData => ({ days: [], activities: [], bookings: [] });
export function monthDates(period: string) {
  if (!validPeriod(period)) return [];
  const [year, month] = period.split('-').map(Number);
  return Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => `${period}-${String(index + 1).padStart(2, '0')}`);
}
export function monthCells(period: string) {
  const dates = monthDates(period);
  if (!dates.length) return [];
  const offset = new Date(`${dates[0]}T12:00:00`).getDay();
  const cells: Array<string | null> = [...Array.from({ length: offset }, () => null), ...dates];
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function shiftCalendarMonth(date: string, offset: number) {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(year, month - 1 + offset, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return dateKey(target);
}
export const dayConfiguration = (data: CalendarData | null, date: string): CalendarConfiguration => data?.days.find(day => day.date === date) || { date, capacity: {} };
export const occupiedPlaces = (data: CalendarData, date: string, service: CalendarService) => new Set(data.bookings.filter(row => row.date === date && row.service === service && row.status === 'confirmed').map(row => row.id)).size;
export function parseCapacity(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}
export function timeRangeError(start?: string, end?: string): string {
  if (!start || !end) return 'Informe os horários de início e término.';
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(start) || !time.test(end)) return 'Informe horários válidos.';
  return start < end ? '' : 'O início deve ser anterior ao término.';
}
export function rangesOverlap(a: { start?: string; end?: string }, b: { start?: string; end?: string }) {
  return !timeRangeError(a.start, a.end) && !timeRangeError(b.start, b.end) && a.start! < b.end! && b.start! < a.end!;
}
export function validateActivity(activity: CalendarActivity, data: CalendarData, policy?: CalendarPolicy) {
  const errors: Record<string, string> = {};
  if (!activity.name.trim()) errors.name = 'Informe o nome da atividade.';
  if (!validISODate(activity.date)) errors.date = 'Data inválida';
  const timing = timeRangeError(activity.start, activity.end);
  if (timing) { errors.start = timing; errors.end = timing; }
  if (!timing && data.activities.some(row => row.id !== activity.id && row.date === activity.date && rangesOverlap(row, activity) && policy?.activityConflict?.(activity, row))) errors.start = 'Esta atividade conflita com outra atividade do dia.';
  return errors;
}
export function validateCalendarCommand(command: CalendarCommand, data: CalendarData, policy?: CalendarPolicy): string[] {
  if (command.kind === 'capacity' || command.kind === 'monthCapacity') {
    if (!Number.isSafeInteger(command.quantity) || command.quantity < 0) return ['Informe uma quantidade inteira maior ou igual a zero.'];
    const dates = command.kind === 'capacity' ? validISODate(command.date) ? [command.date] : [] : monthDates(command.period);
    if (!dates.length) return ['Data ou período inválido.'];
    return dates.filter(date => occupiedPlaces(data, date, command.service) > command.quantity).map(date => `${date.split('-').reverse().join('/')}: há ${occupiedPlaces(data, date, command.service)} agendamentos confirmados para ${command.service}.`);
  }
  if (command.kind === 'activity') return Object.values(validateActivity(command.activity, data, policy));
  if (!validISODate(command.date)) return ['Data inválida'];
  if (command.kind === 'removeActivity') return data.activities.some(row => row.id === command.id && row.date === command.date) ? [] : ['Atividade não encontrada para esta data.'];
  if (command.kind === 'cancelBooking') {
    const booking = data.bookings.find(row => row.id === command.id && row.date === command.date && row.status !== 'cancelled');
    if (!booking) return ['Agendamento não encontrado para esta data.'];
    const error = policy?.cancellationError?.(booking);
    return error ? [error] : [];
  }
  return [];
}
export function validateBookingRequest(booking: CalendarBooking, data: CalendarData) {
  const errors: string[] = [];
  const day = dayConfiguration(data, booking.date);
  if (day.available !== true) errors.push('Esta data não está disponível para novos agendamentos.');
  if (!booking.service) return [...errors, 'Serviço não informado.'];
  const limit = day.capacity[booking.service];
  if (limit === undefined || occupiedPlaces(data, booking.date, booking.service) >= limit) errors.push(`Não há vagas disponíveis para ${booking.service}.`);
  const timing = timeRangeError(booking.start, booking.end);
  if (timing) errors.push(timing);
  if (data.bookings.some(row => row.id !== booking.id && row.petId === booking.petId && row.date === booking.date && row.status === 'confirmed' && rangesOverlap(row, booking))) errors.push('O pet já possui uma reserva com conflito de horário.');
  return errors;
}
export function applyCalendarCommand(data: CalendarData, command: CalendarCommand, policy?: CalendarPolicy): CalendarData {
  const errors = validateCalendarCommand(command, data, policy);
  if (errors.length) throw new Error(errors.join('\n'));
  if (command.kind === 'capacity' || command.kind === 'monthCapacity' || command.kind === 'availability') {
    const dates = command.kind === 'monthCapacity' ? monthDates(command.period) : [command.date];
    const updated = new Map(data.days.map(day => [day.date, day]));
    for (const date of dates) {
      const old = dayConfiguration(data, date);
      updated.set(date, command.kind === 'availability' ? { ...old, available: command.available } : { ...old, capacity: { ...old.capacity, [command.service]: command.quantity } });
    }
    return { ...data, days: [...updated.values()] };
  }
  if (command.kind === 'activity') return { ...data, activities: [...data.activities.filter(row => row.id !== command.activity.id), { ...command.activity, name: command.activity.name.trim() }] };
  if (command.kind === 'removeActivity') return { ...data, activities: data.activities.filter(row => row.id !== command.id) };
  return { ...data, bookings: data.bookings.map(row => row.id === command.id ? { ...row, status: 'cancelled' } : row) };
}
