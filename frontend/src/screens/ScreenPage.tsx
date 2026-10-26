import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DesignContext, DesignRenderer } from '../components/DesignRenderer';
import { Menu } from '../components/Menu';
import { Modal } from '../components/Modal';
import { content, nodes, fieldKey, type DesignNode, type DesignScreen } from '../design/types';
import { isCarousel, rotateCarousel, updateCarouselIndicators } from '../design/carousel';
import { availableCalendarDay, calendarDay, calendarForMonth } from '../design/calendar';
import { bookingDate, bookingMonth, selectionForService, toggleBookingDate, validBookingSelection, recurringBookingDates, toggleCrecheWeekday, weekdayForDate, weekdaysForDates } from '../design/booking';
import { buildBookingCart } from '../services/booking-cart';
import { createPetDraft } from '../services/pet-draft';
import { validatePetForm, validatePetPhoto, type PetRecordIds, type PetRecordKind } from '../services/pet-validation';
import { unconfiguredHolidayCalendar, type HolidayCalendar } from '../services/holidays';
import { clearBookingDraft, draftDatesForCalendar, markBookingDraftReady, readBookingDraft, saveBookingDraft, type BookingDraft } from '../services/booking-draft';
import { structureBookingDesign } from '../design/structure-booking';
import { structureActivities, structureActivityDesign } from '../design/structure-activities';
import { ActivityCatalogDetails } from '../components/ActivityCatalogDetails';
import { isMonitorRecord, monitorRecordKey, monitorRecordValues, monitorRecordDesign, monitorRecordLocked, monitorOptions, type MonitorSavedRecord } from '../design/monitor-records';
import { dashboardDesign, dashboardFormDesign } from '../design/dashboard';
import { useDashboard } from '../services/use-dashboard';
import type { DashboardSource } from '../services/dashboard-model';
import type { DashboardFormMode } from '../services/dashboard-validation';
import { useManagementCalendar } from '../services/use-management-calendar';
import type { CalendarSource } from '../services/calendar-model';
import { managementCalendarDesign } from '../design/management-calendar';
import { ManagementCalendarDialogs } from '../components/ManagementCalendar';
import { checkInFeedDesign, diaryActionsDesign } from '../design/presentation-adjustments';
import { findDesignNode } from '../design/structure-booking';
import { usePetHealthCatalog, type PetHealthCatalogSource } from '../services/pet-health-catalog';
import { PetCatalogDialog } from '../components/PetCatalogDialog';
import { addValidityToVaccineRecord, petInsuranceField, vaccineValidityField } from '../design/pet-health';
import { useTutorSchedule, type TutorScheduleSource } from '../services/tutor-schedule';
import { screens } from './catalog';
import type { EcoDogApi, Operation, Session } from '../services/api';
import { prototypeOperationBlock, recordIdentityUnavailable, monitorDataUnavailable, presenceDataUnavailable } from '../services/prototype-safety';

const imports = import.meta.glob<{ default: DesignScreen }>('../design/*.json');
const load = async (key: string) => (await imports[`../design/${key}.json`]()).default;
const dialogOperations: Record<string, Operation> = { userCreate: 'saveUser', userEdit: 'saveUser', createGoal: 'saveGoal', editGoal: 'saveGoal', loadedGoal: 'saveGoal', revenue: 'saveRevenue', linkPlan: 'saveLink', createPlan: 'savePlan', editPlan: 'savePlan', petEdit: 'savePet' };

function useMobile() {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 1439px)').matches);
  useEffect(() => {
    const mq = matchMedia('(max-width: 1439px)');
    const listener = () => setMobile(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return mobile;
}

export interface ScreenPageProps { id: string; preview?: boolean; api: EcoDogApi; session?: Session | null; holidayCalendar?: HolidayCalendar; dashboardSource?: DashboardSource; calendarSource?: CalendarSource; petHealthCatalogSource?: PetHealthCatalogSource; tutorScheduleSource?: TutorScheduleSource; onSession(session: Session): void }
export function ScreenPage({ id, preview = false, api, session, holidayCalendar = unconfiguredHolidayCalendar, dashboardSource, calendarSource, petHealthCatalogSource, tutorScheduleSource, onSession }: ScreenPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = useMobile();
  const dashboard = useDashboard(id === 'TL13', preview, api, dashboardSource);
  const managementCalendar = useManagementCalendar(id === 'TL14', preview, api, calendarSource);
  const petHealthCatalog = usePetHealthCatalog(id === 'TL06', preview, petHealthCatalogSource);
  const tutorSchedule = useTutorSchedule(id === 'TL05', preview, tutorScheduleSource);
  const [design, setDesign] = useState<DesignScreen | null>(null);
  const [bookingDesign, setBookingDesign] = useState<DesignScreen | null>(null);
  const applyingDraft = useRef<BookingDraft | null>(null);
  const bookingScreen = id === 'TL03' || id === 'TL09';
  const [dialogDesign, setDialogDesign] = useState<DesignScreen | null>(null);
  const [dialog, setDialog] = useState('');
  const [menu, setMenu] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [dialogFields, setDialogFields] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [dialogStep, setDialogStep] = useState(0);
   const [day, setDay] = useState(id === 'TL14' ? 15 : 13);
   const [selectedDates, setSelectedDates] = useState(['2026-08-13']);
   const [crecheWeekdays, setCrecheWeekdays] = useState<number[]>([]);
  const [service, setService] = useState('Hotel');
  const [pets, setPets] = useState(['Thor', 'Mel', 'Luke']);
  const [monthOffset, setMonthOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [activityIndex, setActivityIndex] = useState(0);
  const [monitorSaved, setMonitorSaved] = useState<Record<string, MonitorSavedRecord>>({});
  const monitorSavedRef = useRef<Record<string, MonitorSavedRecord>>({});
  useEffect(() => { setActivityIndex(0); }, [id]);
  const [confirmAction, setConfirmAction] = useState<Operation | null>(null);
   const [allergies, setAllergies] = useState<string[]>([]);
   const [allergyDraft, setAllergyDraft] = useState<string[]>([]);
   const [allergyDescription, setAllergyDescription] = useState('');
  const [repeats, setRepeats] = useState<Record<string, number>>({});
  const [petRecords, setPetRecords] = useState<PetRecordIds>({ vacinas: [0], medicamentos: [0] });
  const petRecordSequence = useRef(1);
  const [petErrors, setPetErrors] = useState<Record<string, string>>({});
  const removePetRecord = (kind: PetRecordKind, recordId: number) => {
    setPetRecords(records => ({ ...records, [kind]: records[kind].filter(id => id !== recordId) }));
    setFields(values => Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith(`${kind}.${recordId}.`))));
    setPetErrors(errors => Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(`${kind}.${recordId}.`))));
  };
  const formRef = useRef<HTMLFormElement>(null);
  const modalFormRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<string | null>(null);
  const [photo, setPhoto] = useState('');
  const [petPhoto, setPetPhoto] = useState<File | null>(null);

  useEffect(() => {
    let canceled = false;
     setDesign(null); setStep(0); setFields({}); setDialog(''); setMessage(''); setMenu(false); setRepeats({});
      setDay(id === 'TL14' ? 15 : 13); setService('Hotel'); setPets(['Thor', 'Mel', 'Luke']); setMonthOffset(id === 'TL09' ? (new Date().getFullYear() - 2026) * 12 + new Date().getMonth() - 7 : 0); setAllergies([]); setPhoto('');
     setSelectedDates(['2026-08-13']);
     if (id === 'TL09') setSelectedDates([]);
     setCrecheWeekdays([]);
    setBookingDesign(null); applyingDraft.current = null;
    const draft = id === 'TL03' ? readBookingDraft() : null;
    Promise.all([load(id), id === 'TL09' ? load('TL03') : Promise.resolve(null)]).then(([data, reference]) => {
      if (canceled) return;
      setDesign(data); setBookingDesign(reference);
      if (id === 'TL03' && draft?.phase === 'ready') {
        setSelectedDates(draftDatesForCalendar(draft, data.desktop));
        setService(draft.service); setCrecheWeekdays(draft.service === 'Creche' ? draft.weekdays : []);
        setMonthOffset(draft.monthOffset); setDay(Number(draft.dates.at(-1)?.slice(-2)) || 0);
        applyingDraft.current = draft;
      }
    }).catch(() => { if (!canceled) setMessage('Não foi possível carregar esta tela.'); });
    window.scrollTo(0, 0);
    return () => { canceled = true; };
  }, [id]);
  const bookingReference = id === 'TL09' ? bookingDesign?.desktop : design?.desktop;
  const bookingDates = service === 'Creche' ? recurringBookingDates(bookingReference, crecheWeekdays, monthOffset) : selectedDates;
  useEffect(() => {
    const draft = applyingDraft.current;
    if (id !== 'TL03' || !design || !draft || service !== draft.service || monthOffset !== draft.monthOffset) return;
    const expected = draftDatesForCalendar(draft, design.desktop);
    if (JSON.stringify(selectedDates) !== JSON.stringify(expected) || JSON.stringify(crecheWeekdays) !== JSON.stringify(draft.service === 'Creche' ? draft.weekdays : [])) return;
    // Clear only after the destination has committed the restored selection.
    clearBookingDraft(draft.token); applyingDraft.current = null;
  }, [id, design, service, monthOffset, selectedDates, crecheWeekdays]);
  const cart = buildBookingCart({ service, dates: bookingDates, frequency: crecheWeekdays.length, month: bookingMonth(monthOffset), petCount: pets.length, holidays: holidayCalendar });
  const selectWeekday = (weekday: number) => {
    if (weekday === 0) return;
    if (!crecheWeekdays.includes(weekday) && crecheWeekdays.length === 6) { setMessage('A Creche permite até seis dias da semana.'); return; }
    const next = toggleCrecheWeekday(crecheWeekdays, weekday);
    if (next.length > crecheWeekdays.length && !recurringBookingDates(bookingReference, [weekday], monthOffset).length) return;
    setCrecheWeekdays(next);
  };
  useEffect(() => () => { if (photoRef.current) URL.revokeObjectURL(photoRef.current); }, []);

   const go = useCallback((screenId: string) => {
     const screen = screens.find(s => s.id === screenId);
    if (screen) {
      const next = () => navigate(preview ? `/prototipo/${screen.id}` : screen.path);
      if (id === 'TL14') managementCalendar.requestLeave(next); else next();
    }
  }, [navigate, preview, id, managementCalendar.requestLeave]);
  const close = useCallback(() => { setDialog(''); setDialogDesign(null); setConfirmAction(null); }, []);
  const closeMenu = useCallback(() => setMenu(false), []);
    const openDialog = async (key: string) => {
      // No listing source links these design examples to domain entities.
      // Do not open a seeded form for a different record or manufacture an ID.
      if (['petEdit', 'editPlan', 'userEdit'].includes(key)) { setMessage(recordIdentityUnavailable); return; }
      setMessage(''); setDialogStep(0); setDialog(key); setDialogDesign(null); setDialogFields({});
      if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(key)) dashboard.begin(key as DashboardFormMode);
     if (key === 'allergies') { setAllergyDraft([...allergies]); setAllergyDescription(''); }
    if (!['confirm', 'allergies', 'details', 'profile'].includes(key)) {
      try {
        const data = await load(key);
        setDialogDesign(data);
        if (['petEdit', 'userEdit', 'editPlan', 'loadedGoal'].includes(key)) {
          const values: Record<string, string> = {};
          const seed = (n: DesignNode) => {
            if (/^Campo$|^Campo /.test(n.name || '')) {
              const kids = nodes(n);
              const label = content(kids[0] || '');
              let value = content(kids.find(c => c.name === 'Entrada') || '');
              if (value && !/Selecione|Informe|Nome do|dd\/mm|R\$ 0|prescrita|Conte|Como seu/.test(value)) {
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) value = value.split('/').reverse().join('-');
                if (/Valor/.test(label)) value = value.replace(/R\$\s*/, '').replaceAll('.', '').replace(',', '.');
                values[fieldKey(label)] = value;
              }
            }
            nodes(n).forEach(seed);
          };
          seed(data.desktop); setDialogFields(values);
        }
      } catch { setMessage('Não foi possível carregar esta tela.'); }
    }
  };
   const validate = (allPetFields = false) => {
     const form = dialog ? modalFormRef.current : formRef.current;
     if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog)) {
       const keys = form ? Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]')).map(input => input.name) : [];
       return !Object.keys(dashboard.validate(keys)).length;
     }
     if (id === 'TL06' && !dialog) {
       const errors = validatePetForm(fields, petRecords);
       const stepKeys = [['nome', 'nascimento', 'raca', 'sexo', 'castrado', 'convenio'], ['veterinario', 'contato', 'relacionamento-com-outros-pets'], ['vacinas.'], ['alergia-'], ['medicamentos.']][step];
       const relevant = allPetFields || !mobile || step === 5 ? errors : Object.fromEntries(Object.entries(errors).filter(([key]) => stepKeys?.some(prefix => key === prefix || key.startsWith(prefix))));
       setPetErrors(relevant);
       if (Object.keys(relevant).length) {
         if (mobile && allPetFields) {
           const key = Object.keys(relevant)[0];
           setStep(key.startsWith('vacinas.') ? 2 : key.startsWith('alergia-') ? 3 : key.startsWith('medicamentos.') ? 4 : ['veterinario', 'contato', 'relacionamento-com-outros-pets'].includes(key) ? 1 : 0);
         }
         setMessage('Confira os campos indicados antes de continuar.');
         return false;
       }
       return true;
     }
     if (!form?.reportValidity()) return false;
    const values = dialog ? dialogFields : fields;
    if ((id === 'TL04' || dialog === 'userCreate') && values.senha !== values['confirmacao-de-senha']) {
      setMessage('Confira a confirmação de senha.'); return false;
    }
    return true;
  };
    const run = async (operation: Operation, needsValidation = false) => {
      const block = prototypeOperationBlock(operation, dialog);
      if (block) { setMessage(block); return; }
     if (busy || needsValidation && !validate(operation === 'savePet')) return;
     if (operation === 'book' && (!validBookingSelection(design?.desktop, bookingDates, service) || service === 'Creche' && (!crecheWeekdays.length || crecheWeekdays.length > 6))) { setMessage('Selecione uma data disponível.'); return; }
     if (operation === 'book' && (!service || !bookingDates.length || !pets.length)) { setMessage('Selecione o serviço, a data e os pets.'); return; }
    setBusy(true); setMessage('');
    try {
        const petDraft = operation === 'savePet' ? createPetDraft(dialog ? dialogFields : fields, allergies, id === 'TL06' && !dialog ? petRecords : undefined) : null;
        if (petDraft && id === 'TL06' && !dialog && petPhoto) petDraft.photo = petPhoto;
         // Only the creation form/draft is sent. Never attach unrelated pet names,
         // design targets or the prototype's day/service to another operation.
         const result = await api.execute(operation, petDraft || (dialog ? dialogFields : fields));
      setMessage(result.message);
      if (operation === 'book') { clearBookingDraft(); await openDialog('confirmation'); }
      else if (operation === 'register') go('TL02');
      else if (operation === 'savePet') go('TL05');
      else close();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  };
    const action = (label: string, node: DesignNode, ancestors: DesignNode[]) => {
      if (id === 'TL11' && label === 'Feed do Monitor') {
        const panel = ancestors.findLast(node => node.name === 'Painel' && !!findDesignNode(node, 'Identificação do auluno'));
        const identity = panel && findDesignNode(panel, 'Identificação do auluno');
        const text = identity ? content(identity).trim() : '';
        const petName = text.split(/\s+Pet\s+\d/)[0].trim();
        navigate(preview ? '/prototipo/TL10' : '/monitor/feed', { state: { monitorContext: { petName, illustrative: true } } });
        return;
      }
      if (id === 'TL14' && label === 'Adicionar atividade') { managementCalendar.addActivity(); return; }
      if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog) && ['Salvar', 'Salvar alterações', 'Criar meta', 'Salvar meta'].includes(label)) {
        void dashboard.save().then(result => {
          if (result.message) setMessage(result.message);
          if (result.success) close();
          else if (mobile && Object.keys(result.errors).length) {
            const key = Object.keys(result.errors)[0];
            const firstStep = dialogDesign?.steps.findIndex(step => {
              const visit = (node: DesignNode): boolean => {
                const label = nodes(node)[0];
                const field = label && fieldKey(content(label));
                if ((field === key || key === 'mes-cadastrado' && field === 'mes') && nodes(node).some(child => /Entrada|Controle/.test(child.name || ''))) return true;
                return nodes(node).some(visit);
              };
              return visit(step);
            });
            setDialogStep(firstStep !== undefined && firstStep >= 0 ? firstStep : 0);
          }
        });
        return;
      }
      if (id === 'TL10' && label === 'Salvar') {
        const record = ancestors.findLast(isMonitorRecord);
        if (!record || busy) return;
        const key = monitorRecordKey(record);
        if (monitorRecordLocked(record, monitorSavedRef.current[key])) { setMessage('Registro protegido: não é permitido sobrescrever este registro. Na prévia, o armazenamento permanece somente em memória.'); return; }
        const values = monitorRecordValues(record, fields);
        if (Object.entries(values).some(([field, value]) => monitorOptions[field] && !monitorOptions[field].includes(value))) { setMessage('Selecione uma opção válida para este registro.'); return; }
        if (preview && import.meta.env.DEV) {
          monitorSavedRef.current = { ...monitorSavedRef.current, [key]: { values: { ...values }, local: true } };
          setMonitorSaved(monitorSavedRef.current);
          setMessage('Registro bloqueado para alterações após salvar somente na prévia, em memória. Não foi salvo no servidor.');
          return;
        }
        setMessage(monitorDataUnavailable);
        return;
      }
      if (id === 'TL09' && (label === 'Atividade anterior' || label === 'Próxima atividade')) {
        setActivityIndex(index => Math.max(0, Math.min(structureActivities.length - 1, index + (label === 'Próxima atividade' ? 1 : -1))));
        return;
      }
     if (label === 'ENTRAR') { go('TL02'); return; }
     if (label === 'CADASTRAR') { go('TL04'); return; }
    if (label === 'Menu') { setMenu(v => !v); return; }
    if (label === 'Assistente') { void openDialog('assistant'); return; }
     if (label.startsWith('Carrossel ') || ['←', '→'].includes(label) && ancestors.some(n => n.name === 'Navegação do carrossel')) {
       const carousel = ancestors.findLast(isCarousel);
       if (carousel) setFields(f => ({ ...f, [`carousel-${carousel.id}`]: String(Number(f[`carousel-${carousel.id}`] || 0) + (label.endsWith('anterior') || label === '←' ? -1 : 1)) }));
      return;
    }
    if (label === 'Fechar' || label === 'Entendi' || label === 'Voltar para Meus Pets') { close(); if (label === 'Voltar para Meus Pets') go('TL05'); return; }
    if (label === 'Cancelar') { if (dialog) close(); else { if (id === 'TL03') { clearBookingDraft(); setSelectedDates([]); setCrecheWeekdays([]); } go('TL05'); } return; }
    if (label === 'Voltar') {
      if (mobile && (dialog ? dialogStep : step) > 0) { dialog ? setDialogStep(s => s - 1) : setStep(s => s - 1); return; }
      if (dialog) { close(); return; }
      go(['TL10', 'TL12'].includes(id) ? 'TL11' : 'TL05'); return;
    }
     if (/Continuar|Avançar|Próximo/.test(label)) {
       if (!validate()) return;
       if (id === 'TL03' && !dialog && mobile && step === 1 && !validBookingSelection(design?.desktop, bookingDates, service)) { setMessage('Selecione uma data disponível.'); return; }
      if (dialog) setDialogStep(s => Math.min(s + 1, (dialogDesign?.steps.length || 1) - 1));
      else setStep(s => Math.min(s + 1, (design?.steps.length || 1) - 1));
      window.scrollTo(0, 0); return;
    }
     if (label.startsWith('Dia ')) {
       const selectedDay = parseInt(label.slice(4));
       if (bookingScreen && (calendarDay(node)?.unavailable || !availableCalendarDay(bookingReference, selectedDay))) return;
       if (bookingScreen) {
         if (service === 'Creche') selectWeekday(weekdayForDate(bookingDate(selectedDay, monthOffset)));
         else setSelectedDates(dates => toggleBookingDate(dates, bookingDate(selectedDay, monthOffset), service));
       }
       setDay(selectedDay); return;
     }
     if (['Creche', 'Hotel', 'DayUse'].includes(label)) {
       if (bookingScreen && label !== service) {
         if (label === 'Creche') {
           const weekdays = weekdaysForDates(bookingDates, monthOffset);
           if (weekdays.length > 6) setMessage('A Creche permite até seis dias da semana.');
           setCrecheWeekdays(weekdays.slice(0, 6));
         } else setSelectedDates(selectionForService(bookingDates, label));
       }
       setService(label);
       return;
     }
     if (bookingScreen && service === 'Creche' && /^Semana [0-6]$/.test(label)) { selectWeekday(Number(label.slice(7))); return; }
     if (label === 'Todos os pets') { setPets(p => p.length === 3 ? [] : ['Thor', 'Mel', 'Luke']); return; }
     if (/^Pet (Thor|Mel|Luke)$/.test(label)) { const pet = label.slice(4); setPets(list => list.includes(pet) ? list.filter(p => p !== pet) : [...list, pet]); return; }
    if (label === '←' || label === '→') { setMonthOffset(m => m + (label === '→' ? 1 : -1)); return; }
    if (label === '×') {
      if (ancestors.some(n => /Pet selecionado/.test(n.name || ''))) {
        const pet = ['Thor', 'Mel', 'Luke'].find(p => ancestors.some(n => content(n).startsWith(p)));
        if (pet) setPets(list => list.filter(p => p !== pet));
      } else if (dialog) close();
      else { setConfirmAction('saveActivity'); void openDialog('confirm'); }
      return;
    }
    if (label === 'Entrar') {
      if (id !== 'TL02') { go('TL02'); return; }
      if (!validate() || busy) return;
      setBusy(true); setMessage('');
       api.login(fields['e-mail'] || fields.email || '', fields.senha || '').then(session => {
         onSession(session);
         const bookingFlow = session.profile === 'tutor' && markBookingDraftReady();
         go(bookingFlow ? 'TL03' : session.profile === 'tutor' ? 'TL05' : session.profile === 'monitor' ? 'TL10' : 'TL13');
      }).catch(error => setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.')).finally(() => setBusy(false)); return;
    }
    if (label === 'Cadastrar') { if (id !== 'TL04') go('TL04'); else void run('register', true); return; }
    if (id === 'TL09' && (label === 'Agendar' || label === 'Quero agendar')) {
      saveBookingDraft({ service: service as 'Hotel' | 'DayUse' | 'Creche', dates: bookingDates, weekdays: service === 'Creche' ? crecheWeekdays : [], monthOffset }, session?.profile === 'tutor');
      navigate(session?.profile === 'tutor' ? '/tutor/agendamento' : '/entrar'); return;
    }
    if (label === 'Agendar') { if (id === 'TL03') void run('book', true); else go('TL03'); return; }
    if (label === 'Agendar visita') { go('TL03'); return; }
    if (label === 'Como funciona') { go('TL08'); return; }
    if (label === 'Adicionar Pet') { go('TL06'); return; }
    if (label === 'Ver diário') { go('TL07'); return; }
    if (/Já tem|Clique aqui/.test(label)) { go('TL02'); return; }
    if (/Não tem login/.test(label)) { go('TL04'); return; }
    if (/Conheça|NOSSO ESPAÇO|Saiba mais/.test(label)) { go(/ESPAÇO|espaço|estrutura/i.test(label) ? 'TL09' : 'TL08'); return; }
    const nav = screens.find(s => s.name.toLowerCase() === label.toLowerCase() || s.id === 'TL08' && label === 'SOBRE' || s.id === 'TL01' && label === 'INÍCIO' || s.id === 'TL04' && label === 'CADASTRE-SE');
    if (nav && !['Criar meta', 'Editar meta'].includes(label)) { go(nav.id); return; }
    if (label === 'Meus Dados') { void openDialog('profile'); return; }
    if (label === 'Criar usuário') { void openDialog('userCreate'); return; }
    if (label === 'Criar Plano') { void openDialog('createPlan'); return; }
    if (label === 'Vincular Plano') { void openDialog('linkPlan'); return; }
    if (label === 'Adicionar receita') { void openDialog('revenue'); return; }
    if (label === 'Criar meta' && !dialog) { void openDialog('createGoal'); return; }
    if (label === 'Editar meta' && !dialog) { void openDialog('editGoal'); return; }
    if (label === 'Selecionar meta') { void openDialog('loadedGoal'); return; }
     if (label === 'Editar') {
       setMessage(recordIdentityUnavailable); return;
     }
    if (label === 'Excluir' || label === 'Desativar' || label === 'Ativar') {
      setConfirmAction(label === 'Excluir' ? id === 'TL17' ? 'deletePlan' : 'deletePet' : id === 'TL15' ? 'setUserActive' : id === 'TL16' ? 'setLinkActive' : 'setPlanActive');
      void openDialog('confirm'); return;
    }
    if (label === 'Adicionar foto') { fileRef.current?.click(); return; }
     if (label === 'Adicionar alergia') { if (id === 'TL06') petHealthCatalog.open('alergias', item => setAllergies(values => [...new Set([...values, item.name])])); else void openDialog('allergies'); return; }
     if (id === 'TL06' && (label === 'Adicionar' || label === '+ Adicionar')) {
       const kind: PetRecordKind = ancestors.some(n => n.id === 'rGbzh' || n.name === 'Card · Vacinas tomadas') ? 'vacinas' : 'medicamentos';
       const recordId = petRecordSequence.current++;
       setPetRecords(records => ({ ...records, [kind]: [...records[kind], recordId] }));
       return;
     }
     if (label === 'Adicionar') {
      const section = ancestors.findLast(n => /Vacinas|Remédio/.test(n.name || ''));
      if (section) setRepeats(r => ({ ...r, [section.id!]: (r[section.id!] || 0) + 1 })); return;
    }
    if (label === 'Registrar entrada') { void run('checkIn'); return; }
    if (label === 'Registrar saída') { void run('checkOut'); return; }
    if (label === 'Concluído') { void run('completeActivity'); return; }
    if (label === 'CONCLUÍDOS') { setFields(v => ({ ...v, filtro: v.filtro ? '' : 'concluidos' })); return; }
    if (label === 'Atividades') { go('TL12'); return; }
    if (label === 'Detalhes' || label === 'Ver detalhes') { void openDialog('details'); return; }
    if (label === 'Adicionar atividade') { void openDialog('details'); return; }
    if (label === 'Alterar') { document.querySelector<HTMLInputElement>('input[type=number]')?.focus(); return; }
    if (/Salvar|Criar meta/.test(label)) {
      void run(dialog ? dialogOperations[dialog] || 'saveRecord' : id === 'TL06' ? 'savePet' : id === 'TL14' ? 'saveCapacity' : 'saveRecord', true); return;
    }
    if (label === 'Enviar') { setMessage('O Assistente EcoMigo ainda depende de integração com o sistema.'); }
  };

   const enhance = (node: DesignNode, inDashboardForm = false): DesignNode => {
     if (id === 'TL09' && bookingDesign) {
       const source = nodes(node);
       const calendar = source.find(child => ['a6sxP', 'aqBV3'].includes(child.id || ''));
       const action = source.find(child => ['pRYPM', 'QNBPU'].includes(child.id || ''));
       if (calendar && action) {
         const replacement = structureBookingDesign(calendar, bookingDesign, mobile, action);
         return { ...node, children: node.children?.flatMap(child => child === action ? [] : [typeof child === 'string' ? child : enhance(child === calendar ? replacement : child)]) };
       }
     }
     if (id === 'TL09' && bookingDesign && ['a6sxP', 'aqBV3'].includes(node.id || '')) return enhance(structureBookingDesign(node, bookingDesign, mobile));
      if (id === 'TL06' && !dialog && ['Registro de vacina', 'Registro de medicamento'].includes(node.name || '')) return { ...(node.name === 'Registro de vacina' ? addValidityToVaccineRecord(node) : node), id: node.name === 'Registro de vacina' ? 'pet-vacinas' : 'pet-medicamentos', name: 'Pet records' };
      if (id === 'TL06' && !dialog && (node.name === 'Listagem de alergias' || node.id === 'x2uAZ')) return { ...node, name: 'Pet allergies' };
      let children = node.children?.filter(c => !(id === 'TL13' && inDashboardForm && content(c).trim() === '×')).filter(c => id !== 'TL06' || typeof c === 'string' || !['e1u9df', 'uwuPj'].includes(c.id || '')).map(c => typeof c === 'string' ? c : enhance(c, inDashboardForm));
      if (id === 'TL06' && !dialog && (node.id === 'CUvkc' || node.name === 'Card · Identificação') && children) {
        const candidates = children.filter((child): child is DesignNode => typeof child !== 'string').flatMap(child => [child, ...nodes(child)]);
        const race = candidates.find(child => content(nodes(child)[0] || '') === 'Raça');
        if (race) {
          const field = petInsuranceField(race);
          const navigationIndex = children.findIndex(child => typeof child !== 'string' && child.name === 'Navegação entre etapas');
          children.splice(navigationIndex >= 0 ? navigationIndex : children.length, 0, field);
        }
      }
      if (id === 'TL06' && !dialog && ['Card · Vacinas tomadas', 'Card · Remédio Controlado'].includes(node.name || '') && children) {
        const kind = node.name === 'Card · Vacinas tomadas' ? 'vacinas' : 'medicamentos';
        const fieldNames = kind === 'vacinas' ? ['Vacina', 'Data'] : ['Remédio', 'Dosagem', 'Frequência'];
        const templates = children.filter((child): child is DesignNode => typeof child !== 'string' && fieldNames.includes(child.name || '') && nodes(child).some(n => n.name === 'Entrada'));
        const recordTemplates = kind === 'vacinas' ? [...templates, vaccineValidityField(templates.find(field => field.name === 'Data')!)] : templates;
        let inserted = false;
        children = children.flatMap(child => {
          if (typeof child === 'string' || !templates.includes(child)) return [child];
          if (inserted) return [];
          inserted = true;
          return [{ tag: 'div', id: `pet-${kind}`, name: 'Pet records', className: 'w-full', children: recordTemplates }];
        });
      }
     if (id === 'TL03' && node.id === 'IjVwX' && children) {
       const values = children.filter(child => typeof child !== 'string' && child.name === 'Valor previsto');
       const details = children.filter(child => typeof child === 'string' || child.name !== 'Valor previsto');
       children = [{ tag: 'h2', id: 'booking-summary-title', name: 'Título do resumo', className: 'booking-section-title font-interface text-[var(--brand)] w-full', children: ['Resumo do Agendamento'] }, ...values, ...details];
     }
     if (id === 'TL02') children = children?.map(child => typeof child === 'string' ? child.replace('acompanhar seus aumigos.', 'acompanhar seus pets.') : child);
     if (id === 'TL05' && node.name === 'Meus planos' && children) {
       const parts = children.filter((child): child is DesignNode => typeof child !== 'string');
       const header = parts.find(child => child.name === 'Título e agendamento');
       const card = parts.find(child => child.name === 'Plano contratado');
       const schedule = parts.find(child => child.name === 'Ação');
       if (header && card) {
         const table: DesignNode = {
           tag: 'div', id: `${card.id}-contents`, name: 'Plano contratado',
           className: `box-border w-full h-fit flex flex-col${mobile ? ' gap-[20px]' : ''}`,
           children: card.children,
         };
         children = [{ ...card, tag: 'section', name: 'Meus Planos • Card', children: [header, table, ...(schedule ? [schedule] : [])] }];
       }
     }
     if (id === 'TL03' && !mobile && node.id === 'PyCgJ') {
       let valuesCard: DesignNode | undefined;
       const removeValuesCard = (child: DesignNode | string): DesignNode | string | null => {
         if (typeof child === 'string') return child;
         if (child.id === 'IjVwX') { valuesCard = child; return null; }
         return { ...child, children: child.children?.map(removeValuesCard).filter((item): item is DesignNode | string => item !== null) };
       };
       children = children?.map(removeValuesCard).filter((item): item is DesignNode | string => item !== null);
       if (valuesCard && children?.length) children = [children[0], ...children.slice(1), { ...valuesCard, tag: 'aside' }];
     }
    if (repeats[node.id!] && children) {
      const group = children.findLast(c => typeof c !== 'string' && c.name === 'Grupo de campos') as DesignNode | undefined;
      if (group) for (let i = 0; i < repeats[node.id!]; i++) children = [...children!, { ...group, id: `${group.id}-extra-${i}`, children: group.children?.map(c => typeof c === 'string' ? c : { ...c, id: `${c.id}-extra-${i}` }) }];
    }
     if (isCarousel(node)) {
       const offset = Number(fields[`carousel-${node.id}`] || 0);
       children = updateCarouselIndicators(rotateCarousel({ ...node, children }, offset), offset).children;
     }
     if (bookingScreen && node.name === 'Calendário de agosto') return { ...node, className: `${node.className} booking-calendar`, children: calendarForMonth({ ...node, children }, monthOffset).children };
    if (photo && /Foto do pet/.test(node.name || '') && !content(node)) return { ...node, tag: 'img', src: photo, decorative: false };
    if (node.name === 'Vínculo' && fields.pesquisa && !content(node).toLowerCase().includes(fields.pesquisa.toLowerCase())) return { ...node, className: 'hidden', children: [] };
    if (id === 'TL09' && ['dxjWO', 'yqTjv'].includes(node.id || '')) return structureActivityDesign({ ...node, children }, activityIndex);
    if (id === 'TL10' && isMonitorRecord(node)) return monitorRecordDesign({ ...node, children }, fields, monitorSaved[monitorRecordKey(node)]);
    if (id === 'TL07') return diaryActionsDesign({ ...node, children });
    if (id === 'TL11') return checkInFeedDesign({ ...node, children });
    if (id === 'TL14') return managementCalendarDesign({ ...node, children }, managementCalendar);
    if (id === 'TL13') {
      if (inDashboardForm && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog)) return dashboardFormDesign({ ...node, children }, dashboard.mode, dashboard.values, dashboard.data);
      if (content(node).includes('Dados ilustrativos do wireframe') && !nodes(node).length) return { ...node, children: [dashboard.loading ? 'Carregando dados do dashboard…' : dashboard.loadError || (dashboard.example ? content(node) : 'Dados carregados pelo adaptador do dashboard.')] };
      return dashboardDesign({ ...node, children }, dashboard.data);
    }
    return { ...node, children };
  };
    const context = { screen: id, mobile, monitorSaved, modal: false, fields: dialog ? dialogFields : fields, setField: (key: string, value: string) => {
      if (id === 'TL10' && key.startsWith('monitor.') && monitorSavedRef.current[key.split('.')[1]]) return;
     (dialog ? setDialogFields : setFields)(f => ({ ...f, [key]: value }));
     if (id === 'TL06' && !dialog) setPetErrors(errors => {
       const updated = validatePetForm({ ...fields, [key]: value }, petRecords);
       return Object.fromEntries(Object.keys(errors).filter(key => updated[key]).map(key => [key, updated[key]]));
     });
   }, tutorSchedule: id === 'TL05' ? tutorSchedule : undefined, petHealthCatalog: id === 'TL06' ? petHealthCatalog : undefined, managementCalendar: id === 'TL14' ? managementCalendar : undefined, dashboard: id === 'TL13' ? dashboard : undefined, activityIndex, petRecords, petErrors, removePetRecord, petAllergies: allergies, setPetAllergies: setAllergies, action, day, selectedDates: bookingDates, crecheWeekdays, cart, removeDate: (date: string) => { if (service !== 'Creche') setSelectedDates(dates => dates.filter(selected => selected !== date)); }, service, pets, busy: busy || id === 'TL13' && dashboard.saving || id === 'TL14' && managementCalendar.saving, search: fields.pesquisa || '', monthOffset };
  const screen = design && (mobile ? design.steps[step] || design.mobile : design.desktop);
  const modalScreen = dialogDesign && (mobile ? dialogDesign.steps[dialogStep] || dialogDesign.mobile : dialogDesign.desktop);
  const info = screens.find(s => s.id === id)!;
  return <>
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    {preview && <aside className="preview-bar" aria-label="Prévia de desenvolvimento">
      <span>Protótipo • dados ilustrativos</span>
      <label><span className="sr-only">Tela</span><select aria-label="Tela do protótipo" value={id} onChange={e => go(e.target.value)}>{screens.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}</select></label>
      <button type="button" onClick={() => navigate('/')}>Sair da prévia</button>
    </aside>}
    <main id="main-content" className={`design-page ${mobile ? 'design-mobile' : 'design-desktop'}${['TL01', 'TL08', 'TL09'].includes(id) ? ' institutional-page' : ''}${id === 'TL07' ? ' diary-page' : ''}${id === 'TL06' ? ' pet-registration-page' : ''}${id === 'TL10' ? ' monitor-feed-page' : ''}${id === 'TL13' ? ' dashboard-page' : ''}${id === 'TL14' ? ' management-calendar-page' : ''}`} aria-label={info.name}>
      {id === 'TL09' && !preview && import.meta.env.VITE_API_BASE_URL && <button type="button" className="management-button" onClick={() => void openDialog('details')}>Consultar catálogo de atividades</button>}
      {id === 'TL10' && <p className="loading-message" role="status">{monitorDataUnavailable} {preview ? 'Novos rascunhos podem ser salvos apenas em memória e ficam bloqueados para alterações nesta sessão; recarregar a página descarta esses dados.' : 'Registros apresentados são exemplos, não histórico consultado do sistema.'}</p>}
      {id === 'TL11' && <p className="loading-message" role="status">{presenceDataUnavailable} Horários, presença e contadores dos cartões são exemplos, não registros consultados do sistema.</p>}
      {id === 'TL06' && petHealthCatalog.message && <p className="loading-message" role="status">{petHealthCatalog.message}</p>}
      {id === 'TL10' && location.state?.monitorContext?.petName && <p className="loading-message">Contexto recebido: {location.state.monitorContext.petName}. Os dados do feed continuam ilustrativos até a integração por pet e agendamento.</p>}
      {id === 'TL13' && (dashboard.loading || dashboard.loadError) && <p className="loading-message" role={dashboard.loadError ? 'alert' : 'status'}>{dashboard.loadError || 'Carregando dados do dashboard…'}</p>}
      {!design && <p role="status" className="loading-message">{message || 'Carregando…'}</p>}
      {screen && <DesignContext.Provider value={context}>
        <form ref={formRef} onSubmit={e => e.preventDefault()} aria-label={info.name}>
          <DesignRenderer node={enhance(screen)} root />
        </form>
      </DesignContext.Provider>}
      {menu && <Menu current={id} profile={info.profile || 'public'} go={go} close={closeMenu} />}
    </main>
    <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-label="Foto do pet" accept="image/*" onChange={e => {
       const file = e.target.files?.[0];
       if (file) {
         if (id === 'TL06') {
           const error = validatePetPhoto(file);
           if (error) { setMessage(error); e.target.value = ''; return; }
           setPetPhoto(file);
         }
        if (photoRef.current) URL.revokeObjectURL(photoRef.current);
        photoRef.current = URL.createObjectURL(file); setPhoto(photoRef.current);
      }
    }} />
    {(message || busy) && <div className="status-message" role={busy ? 'status' : 'alert'}>{busy ? 'Aguarde…' : message}<button type="button" aria-label="Fechar mensagem" onClick={() => setMessage('')}>×</button></div>}
    {id === 'TL14' && <ManagementCalendarDialogs calendar={managementCalendar} />}
    {id === 'TL06' && <PetCatalogDialog catalog={petHealthCatalog} />}
    {dialog && <Modal title={dialog === 'assistant' ? 'Assistente EcoMigo' : dialog === 'confirm' ? 'Confirmar operação' : 'Formulário'} onClose={close} wide={dialog === 'petEdit'}>
      {dialog === 'linkPlan' && <p className="dialog-content" role="status">{recordIdentityUnavailable} O formulário permanece apenas como rascunho ilustrativo de vínculo.</p>}
      {modalScreen ? <DesignContext.Provider value={{ ...context, modal: true }}><form ref={modalFormRef} className={id === 'TL13' ? 'dashboard-form' : undefined} onSubmit={e => e.preventDefault()}><DesignRenderer node={enhance(modalScreen, id === 'TL13')} root /></form></DesignContext.Provider>
        : dialog === 'confirm' ? <div className="dialog-content"><h2>Confirmar operação</h2><p>Deseja confirmar esta ação?</p><div className="dialog-actions"><button type="button" onClick={close}>Cancelar</button><button type="button" disabled={busy} onClick={() => confirmAction && void run(confirmAction)}>Confirmar</button></div></div>
         : dialog === 'allergies' ? <form ref={modalFormRef} className="dialog-content" onSubmit={e => {
           e.preventDefault();
           const description = allergyDescription.trim();
           if (allergyDraft.includes('Outros') && !description) return;
           setAllergies([...new Set([...allergyDraft.filter(a => a !== 'Outros'), ...(allergyDraft.includes('Outros') ? [description] : [])])]);
           close();
         }}><h2>Alergias</h2><p>Selecione uma ou mais alergias previamente cadastradas. Quando “Outros” for selecionado, o campo de descrição personalizada será exibido.</p>{[...new Set(['Alergia a frango', ...allergies, 'Outros'])].map(a => <label key={a} className="allergy-option"><input type="checkbox" checked={allergyDraft.includes(a)} onChange={e => setAllergyDraft(v => e.target.checked ? [...v, a] : v.filter(x => x !== a))} />{a}</label>)}{allergyDraft.includes('Outros') && <label className="allergy-description">Descrição da alergia *<input required value={allergyDescription} onChange={e => setAllergyDescription(e.target.value)} /></label>}<div className="dialog-actions"><button type="button" onClick={close}>Cancelar</button><button type="submit" disabled={allergyDraft.includes('Outros') && !allergyDescription.trim()}>Salvar alergia</button></div></form>
         : dialog === 'details' && id === 'TL09' && !preview ? <ActivityCatalogDetails close={close} />
         : dialog === 'details' ? <div className="dialog-content"><h2>Detalhes</h2><p>Os detalhes desta atividade dependem dos dados do sistema.</p><button type="button" onClick={close}>Voltar</button></div>
        : dialog === 'profile' ? <div className="dialog-content"><h2>Meus Dados</h2><p>Os dados da conta dependem da autenticação no sistema.</p><button type="button" onClick={close}>Voltar</button></div>
        : <p role="status" className="loading-message">Carregando…</p>}
    </Modal>}
  </>;
}
