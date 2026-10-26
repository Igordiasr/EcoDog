import { describe, expect, it, vi } from 'vitest';
import { blockedCalendarSource, calendarActivityRequest, calendarCapacityRequest, parseCalendarCatalog, parseCalendarDates, parseCalendarDay, prepareCalendarSource } from '../src/services/calendar-api';

const day = (date = '2026-10-25', configured = true) => ({ data: date, idCalendario: configured ? 1 : null, vagasCreche: configured ? 10 : 0, vagasHotel: configured ? 5 : 0, atividades: [], alunosAgendados: [] });
const catalog = [{ idAtividade: 7, idAtividadeDoDia: null, nome: 'Passeio', horaInicio: null, horaFim: null }];
describe('calendar contracts and gates', () => {
  it('prepares both capacities without filling unknown values with zero', () => {
    expect(calendarCapacityRequest('2026-10-25', 'Creche', 8, parseCalendarDay(day(), '2026-10-25')).options.body).toEqual({ vagasCreche: 8, vagasHotel: 5 });
    expect(() => calendarCapacityRequest('2026-10-25', 'Creche', 8, parseCalendarDay(day(undefined, false), '2026-10-25'))).toThrow('valores reais');
  });
  it('keeps unconfigured days and availability unknown', () => {
    const result = parseCalendarDay(day(undefined, false), '2026-10-25');
    expect(result.days[0]).toEqual({ date: '2026-10-25', calendarId: null, configured: false, capacity: {} });
    expect(result.occupancyKnown).toBe(false);
  });
  it('preserves all student states, age and real identities without service/time', () => {
    const response = { ...day(), alunosAgendados: ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'].map((situacao, i) => ({ idAgendamento: i + 1, idPet: 8, nome: 'Bob', raca: null, idade: 3, tutor: 'Ana', situacao })) };
    const result = parseCalendarDay(response, response.data);
    expect(result.bookings.map(row => row.status)).toEqual(['pending', 'confirmed', 'withdrawn', 'cancelled']);
    expect(result.bookings[0]).toMatchObject({ id: '1', petId: '8', age: 3 });
    expect(result.bookings[0]).not.toHaveProperty('service');
    expect(result.bookings[0]).not.toHaveProperty('birthDate');
    expect(result.bookings[0]).not.toHaveProperty('start');
  });
  it('rejects invalid dates, quantities, duplicates and unknown states', () => {
    expect(() => parseCalendarDates(['2026-11-01'], '2026-10')).toThrow();
    expect(() => parseCalendarDates(['2026-10-25', '2026-10-25'], '2026-10')).toThrow();
    expect(() => parseCalendarDay({ ...day(), vagasHotel: -1 }, '2026-10-25')).toThrow();
    expect(() => parseCalendarDay(day(), '2026-10-26')).toThrow();
    expect(() => parseCalendarCatalog([{ ...catalog[0], idAtividade: 1.5 }])).toThrow();
  });
  it('loads configured days plus selection with bounded concurrency', async () => {
    let active = 0, maximum = 0;
    const dates = Array.from({ length: 9 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
    const transport = vi.fn(async (path, options) => {
      if (path.endsWith('/dias')) return dates;
      if (path.endsWith('/catalogo-atividades')) return catalog;
      active++; maximum = Math.max(maximum, active);
      await Promise.resolve(); active--;
      return day(options.query.data, options.query.data !== '2026-10-25');
    });
    const result = await prepareCalendarSource(transport).loadMonth('2026-10', undefined, '2026-10-25');
    expect(result.days).toHaveLength(10); expect(maximum).toBeLessThanOrEqual(4);
    expect(result.catalog).toEqual([{ id: '7', name: 'Passeio' }]);
  });
  it('fails the entire month on one day failure, never creates partial writable data', async () => {
    const source = prepareCalendarSource(async path => { if (path.endsWith('/dias')) return ['2026-10-25']; throw new Error('Falha do dia'); });
    await expect(source.loadMonth('2026-10')).rejects.toThrow('Falha do dia');
    await expect(source.apply!({ kind: 'availability', date: '2026-10-25', available: false })).rejects.toThrow('indisponível');
  });
  it('honors abort and blocks production reads and writes without HTTP', async () => {
    const controller = new AbortController(); controller.abort();
    const source = prepareCalendarSource(async () => ['2026-10-25']);
    await expect(source.loadMonth('2026-10', controller.signal)).rejects.toThrow();
    await expect(blockedCalendarSource.loadMonth('2026-10')).rejects.toThrow('SEC-01');
    await expect(blockedCalendarSource.apply!({ kind: 'capacity', date: '2026-10-25', service: 'Creche', quantity: 4 })).rejects.toThrow('SEC-01');
  });
  it('prepares catalog IDs and schedule IDs separately; never emulates edits', () => {
    const activity = { id: '9', catalogId: '7', name: 'Passeio', date: '2026-10-25', start: '09:00', end: '10:00' };
    const data = { days: [], bookings: [], activities: [activity], catalog: parseCalendarCatalog(catalog) };
    expect(calendarActivityRequest({ kind: 'removeActivity', id: '9', date: activity.date }, data)).toEqual({ path: '/calendario/atividades/9', options: { method: 'DELETE' } });
    expect(() => calendarActivityRequest({ kind: 'activity', activity }, data)).toThrow('Edição');
    expect(calendarActivityRequest({ kind: 'activity', activity: { ...activity, id: 'new' } }, data).options.body).toEqual({ idAtividade: 7, horaInicio: '09:00', horaFim: '10:00' });
    expect(() => calendarActivityRequest({ kind: 'monthCapacity', period: '2026-10', service: 'Creche', quantity: 5 }, data)).toThrow();
  });
});
