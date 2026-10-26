import { useCallback, useEffect, useRef, useState } from 'react';
import type { EcoDogApi } from './api';
import { IntegrationPending } from './api';
import { blockedCalendarSource } from './calendar-api';
import { dateKey, validISODate } from './dashboard-model';
import { applyCalendarCommand, dayConfiguration, parseCapacity, shiftCalendarMonth, validateActivity, validateCalendarCommand, type CalendarActivity, type CalendarCommand, type CalendarData, type CalendarService, type CalendarSource } from './calendar-model';

export interface CalendarConfirmation { title: string; message: string; run(): void | Promise<void> }
export function useManagementCalendar(enabled: boolean, preview: boolean, api: EcoDogApi, source?: CalendarSource) {
  if (preview) source = undefined;
  else source ??= blockedCalendarSource;
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const period = selectedDate.slice(0, 7);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);
  const leaving = useRef(false);
  const sequence = useRef(0);
  const loadSequence = useRef(0);
  const cache = useRef(new Map<string, CalendarData>());
  const [editing, setEditing] = useState<Partial<Record<CalendarService, boolean>>>({});
  const [drafts, setDrafts] = useState<Record<CalendarService, string>>({ Creche: '', Hotel: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<CalendarConfirmation | null>(null);
  const [activity, setActivity] = useState<CalendarActivity | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ service: CalendarService; quantity: string } | null>(null);
  const example = import.meta.env.DEV && preview && !source;
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const request = ++loadSequence.current;
    const controller = new AbortController();
    setLoading(true); setLoadError(''); setData(null);
    const load = source ? source.loadMonth(period, controller.signal, selectedDate) : example ? import('./calendar-examples').then(module => cache.current.get(period) || module.calendarExamples(period)) : Promise.reject(new IntegrationPending());
    load.then(result => { if (active && request === loadSequence.current) setData(result); }).catch(error => { if (active && request === loadSequence.current) setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o calendário.'); }).finally(() => { if (active && request === loadSequence.current) setLoading(false); });
    return () => { active = false; ++loadSequence.current; controller.abort(); };
  }, [enabled, period, source, example, selectedDate]);
  const can = (kind: CalendarCommand['kind'] | 'editActivity') => !!data && !loading && !loadError && (example || source?.capabilities?.[kind] !== false);
  const configuration = dayConfiguration(data, selectedDate);
  const previousDate = useRef(selectedDate);
  useEffect(() => {
    const changedDate = previousDate.current !== selectedDate;
    if (changedDate) leaving.current = false;
    previousDate.current = selectedDate;
    setDrafts(current => ({ Creche: !changedDate && editing.Creche ? current.Creche : configuration.capacity.Creche === undefined ? '' : String(configuration.capacity.Creche), Hotel: !changedDate && editing.Hotel ? current.Hotel : configuration.capacity.Hotel === undefined ? '' : String(configuration.capacity.Hotel) }));
    if (changedDate) { setEditing({}); setErrors({}); }
  }, [data, selectedDate]);
  const capacityDirty = (['Creche', 'Hotel'] as const).some(service => editing[service] && drafts[service] !== (configuration.capacity[service] === undefined ? '' : String(configuration.capacity[service])));
  const originalActivity = data?.activities.find(row => row.id === activity?.id);
  const activityDirty = !!activity && (activity.name !== (originalActivity?.name || '') || activity.start !== (originalActivity?.start || '') || activity.end !== (originalActivity?.end || ''));
  const dirty = capacityDirty || activityDirty || !!bulk?.quantity;
  const discard = () => { setDrafts({ Creche: configuration.capacity.Creche === undefined ? '' : String(configuration.capacity.Creche), Hotel: configuration.capacity.Hotel === undefined ? '' : String(configuration.capacity.Hotel) }); setEditing({}); setActivity(null); setBulk(null); setErrors({}); };
  const requestLeave = useCallback((run: () => void) => {
    if (inFlight.current) return;
    if (!dirty) { run(); return; }
    setConfirmation({ title: 'Alterações não salvas', message: 'Existem alterações não salvas. Deseja descartá-las e continuar?', run: () => { leaving.current = true; discard(); run(); } });
  }, [dirty, data, selectedDate]);
  useEffect(() => {
    if (!enabled || !dirty) return;
    const unload = (event: BeforeUnloadEvent) => { if (!leaving.current) { event.preventDefault(); event.returnValue = ''; } };
    const click = (event: MouseEvent) => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank') return;
      const target = new URL(link.href);
      if (target.origin === location.origin && target.pathname === location.pathname) return;
      event.preventDefault(); event.stopPropagation();
      requestLeave(() => { location.assign(link.href); });
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', click, true);
    const currentUrl = location.href, currentState = history.state;
    let restoring = false;
    const pop = (event: PopStateEvent) => {
      if (restoring || leaving.current) { restoring = false; return; }
      if (window.confirm('Existem alterações não salvas. Deseja descartá-las e sair?')) { leaving.current = true; return; }
      event.stopImmediatePropagation();
      const delta = typeof currentState?.idx === 'number' && typeof event.state?.idx === 'number' ? currentState.idx - event.state.idx : 0;
      if (delta) { restoring = true; history.go(delta); }
      else history.pushState(currentState, '', currentUrl);
    };
    window.addEventListener('popstate', pop, true);
    return () => { window.removeEventListener('beforeunload', unload); window.removeEventListener('popstate', pop, true); document.removeEventListener('click', click, true); };
  }, [enabled, dirty, requestLeave]);
  const selectDate = (date: string) => {
    if (!validISODate(date)) { setMessage('Data inválida'); return; }
    requestLeave(() => setSelectedDate(date));
  };
  const commit = async (command: CalendarCommand) => {
    if (inFlight.current || !data) return false;
    if (!can(command.kind) || command.kind === 'activity' && data.activities.some(row => row.id === command.activity.id) && !can('editActivity')) { setMessage('Operação indisponível: contrato, autorização ou concorrência pendente.'); return false; }
    const validation = validateCalendarCommand(command, data, source);
    if (validation.length) { setMessage(validation.join('\n')); return false; }
    inFlight.current = true; setSaving(true); setMessage('');
    try {
      if (example) {
        const next = applyCalendarCommand(data, command);
        cache.current.set(period, next); setData(next);
        setMessage('Mock atualizado somente em memória. Não foi salvo no servidor.');
      } else {
        if (source?.apply) await source.apply(command);
        else if (command.kind === 'capacity') await api.execute('saveCapacity', { target: command.date, service: command.service, quantidade: command.quantity });
        else if (command.kind === 'activity') await api.execute('saveActivity', { target: command.activity.id, date: command.activity.date, nome: command.activity.name, inicio: command.activity.start, fim: command.activity.end });
        else throw new IntegrationPending();
        if (source) {
          try { setData(await source.loadMonth(period, undefined, selectedDate)); }
          catch (error) {
            setData(null);
            setLoadError(`Operação confirmada, mas não foi possível recarregar o calendário: ${error instanceof Error ? error.message : 'falha de carregamento'}`);
            setMessage('Não repita a gravação. Utilize Recarregar dados para consultar o resultado.');
            return true;
          }
        }
        setMessage('Operação confirmada pelo adaptador. Dados do calendário atualizados.');
      }
      return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível concluir. Os dados preenchidos foram preservados.'); return false; }
    finally { inFlight.current = false; setSaving(false); }
  };
  const saveCapacity = async (service: CalendarService) => {
    const quantity = parseCapacity(drafts[service]);
    const validation = quantity === null ? ['Informe uma quantidade inteira maior ou igual a zero.'] : data ? validateCalendarCommand({ kind: 'capacity', date: selectedDate, service, quantity }, data) : ['Dados indisponíveis.'];
    setErrors(errors => ({ ...errors, [service]: validation.join('\n') }));
    if (validation.length || quantity === null) return;
    if (await commit({ kind: 'capacity', date: selectedDate, service, quantity })) setEditing(values => ({ ...values, [service]: false }));
  };
  const saveActivity = async () => {
    if (!activity || !data) return;
    const validation = validateActivity(activity, data, source); setErrors(validation);
    if (Object.keys(validation).length) return;
    if (await commit({ kind: 'activity', activity })) setActivity(null);
  };
  const confirmBulk = () => {
    if (!bulk || !data) return;
    const quantity = parseCapacity(bulk.quantity);
    const validation = quantity === null ? ['Informe uma quantidade inteira maior ou igual a zero.'] : validateCalendarCommand({ kind: 'monthCapacity', period, service: bulk.service, quantity }, data);
    setErrors({ bulk: validation.join('\n') });
    if (quantity === null || validation.length) return;
    const command: CalendarCommand = { kind: 'monthCapacity', period, service: bulk.service, quantity };
    setConfirmation({ title: 'Confirmar alteração mensal', message: `Aplicar ${quantity} vagas de ${bulk.service} a todos os dias de ${period}? Atividades, disponibilidade e agendamentos serão preservados.`, run: async () => { if (await commit(command)) setBulk(null); } });
  };
  const changeAvailability = (available: boolean) => {
    if (!data) return;
    const bookings = data.bookings.filter(row => row.date === selectedDate && row.status !== 'cancelled');
    const run = async () => { await commit({ kind: 'availability', date: selectedDate, available }); };
    if (!available && bookings.length) setConfirmation({ title: 'Confirmar indisponibilidade', message: `Esta data possui ${bookings.length} agendamento(s). Impedir novos agendamentos? Os existentes não serão excluídos.`, run });
    else void run();
  };
  const removeActivity = (row: CalendarActivity) => setConfirmation({ title: 'Remover atividade', message: `Remover ${row.name} de ${row.date.split('-').reverse().join('/')}?`, run: async () => { if (await commit({ kind: 'removeActivity', id: row.id, date: row.date })) setActivity(null); } });
  const cancelBooking = (id: string) => {
    const booking = data?.bookings.find(row => row.id === id);
    if (!booking || !data) return;
    const validation = validateCalendarCommand({ kind: 'cancelBooking', id, date: booking.date }, data, source);
    if (validation.length) { setMessage(validation.join('\n')); return; }
    setConfirmation({ title: 'Cancelar agendamento', message: `Cancelar o agendamento de ${booking.petName} em ${booking.date.split('-').reverse().join('/')}? O cadastro do pet e do tutor será preservado. A operação está sujeita à política do sistema.`, run: async () => { if (await commit({ kind: 'cancelBooking', id, date: booking.date })) setBookingId(null); } });
  };
  const reload = async () => {
    if (inFlight.current) return;
    const request = ++loadSequence.current;
    setLoading(true); setLoadError(''); setData(null);
    try {
       if (source) { const result = await source.loadMonth(period, undefined, selectedDate); if (request === loadSequence.current) setData(result); }
      else if (import.meta.env.DEV && example) { const module = await import('./calendar-examples'); setData(cache.current.get(period) || module.calendarExamples(period)); }
      else throw new IntegrationPending();
    }
    catch (error) { if (request === loadSequence.current) setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o calendário.'); }
    finally { if (request === loadSequence.current) setLoading(false); }
  };
   return { can, selectedDate, period, data, loading, loadError, message, setMessage, saving, example, configuration, editing, setEditing, drafts, setDrafts, errors, setErrors, confirmation, setConfirmation, activity, setActivity, bookingId, setBookingId, bulk, setBulk, dirty, requestLeave, selectDate, navigateMonth: (offset: number) => selectDate(shiftCalendarMonth(selectedDate, offset)), commit, reload, saveCapacity, saveActivity, confirmBulk, changeAvailability, removeActivity, cancelBooking, addActivity: () => { if (!can('activity')) { setMessage('Programação indisponível: autorização e concorrência pendentes.'); return; } setErrors({}); setActivity({ id: `frontend-activity-${sequence.current++}`, date: selectedDate, name: '', start: '', end: '' }); } };
}
export type ManagementCalendarController = ReturnType<typeof useManagementCalendar>;
