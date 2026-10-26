import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../src/App';
import type { EcoDogApi } from '../../src/services/api';
import { calendarExamples } from '../../src/services/calendar-examples';
import { applyCalendarCommand, emptyCalendarData, type CalendarData, type CalendarSource } from '../../src/services/calendar-model';
import { dateKey } from '../../src/services/dashboard-model';
import { parseCalendarDay, blockedCalendarSource } from '../../src/services/calendar-api';
import '../../src/styles.css';

// Test-only normalized adapters; no production endpoints or responses are defined.
const params = new URLSearchParams(location.search), cache = new Map<string, CalendarData>();
const calls: unknown[] = [];
function initial(period: string): CalendarData {
  if (params.has('empty')) return emptyCalendarData();
  const data = calendarExamples(period), date = data.activities[0].date;
  for (let index = 0; index < 6; index++) {
    const hour = String(10 + index).padStart(2, '0');
    data.activities.push({ id: `fixture-activity-${index}`, date, name: `Atividade de teste ${index + 2}`, start: `${hour}:00`, end: `${hour}:30` });
    data.bookings.push({ id: `fixture-booking-${index}`, date, petId: `fixture-pet-${index}`, petName: `Pet de teste ${index + 2}`, service: index < 4 ? 'Creche' : 'Hotel', status: 'confirmed', tutor: 'Tutor de teste', start: '08:00', end: '17:00' });
  }
  const tomorrow = new Date(`${date}T12:00:00`); tomorrow.setDate(tomorrow.getDate() + 1);
  data.bookings.push({ ...data.bookings[0], id: 'fixture-next-day', date: dateKey(tomorrow) });
  return data;
}
const source: CalendarSource = {
  capabilities: params.has('contract') ? blockedCalendarSource.capabilities : undefined,
  activityConflict() { return true; },
  cancellationError() { return params.has('denyCancel') ? 'Cancelamento bloqueado pela política de teste.' : null; },
   async loadMonth(period, _signal, selectedDate) {
     await new Promise(resolve => setTimeout(resolve, params.has('contract') && selectedDate?.endsWith('26') ? 200 : 25));
     if (params.has('loadFailure')) throw new Error('Falha de teste no carregamento do calendário.');
     if (params.has('reloadFailure') && calls.length) throw new Error('Falha de teste após gravação.');
     if (params.has('contract')) {
       const date = selectedDate || `${period}-25`;
       return parseCalendarDay({ data: date, idCalendario: null, vagasCreche: 0, vagasHotel: 0, atividades: [], alunosAgendados: ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'].map((situacao, i) => ({ idAgendamento: i + 1, idPet: i + 1, nome: `Aluno ${date} ${i}`, idade: 3, raca: null, tutor: 'Ana', situacao })) }, date);
     }
    if (!cache.has(period)) cache.set(period, initial(period));
    return structuredClone(cache.get(period)!);
  },
  async apply(command) {
    calls.push(command); sessionStorage.setItem('fixture:calendar-calls', JSON.stringify(calls));
    await new Promise(resolve => setTimeout(resolve, 100));
    if (params.has('failure')) throw new Error('Falha de teste ao salvar o calendário.');
    const period = command.kind === 'monthCapacity' ? command.period : command.kind === 'activity' ? command.activity.date.slice(0, 7) : command.date.slice(0, 7);
    cache.set(period, applyCalendarCommand(cache.get(period)!, command, source));
  },
};
const api: EcoDogApi = {
  async session() { return { userId: 'calendar-admin', name: 'Admin de teste', profile: 'admin' }; },
  async login() { throw new Error('Login não utilizado.'); },
  async logout() {},
  async execute() { throw new Error('Operação inesperada na fixture.'); },
};
history.replaceState(null, '', '/admin/calendario');
createRoot(document.getElementById('root')!).render(<BrowserRouter><App api={api} calendarSource={source} /></BrowserRouter>);
