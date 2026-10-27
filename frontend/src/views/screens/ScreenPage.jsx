import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DesignContext, DesignRenderer } from '../components/DesignRenderer';
import { Menu } from '../components/Menu';
import { Modal } from '../components/Modal';
import { content, nodes, fieldKey } from '../design/types';
import { isCarousel, rotateCarousel, updateCarouselIndicators } from '../design/carousel';
import { calendarDay, calendarForMonth } from '../design/calendar';
import { categoryForService, loadActiveServices, loadBookingAvailability } from '../../api/booking-availability';
import { bookingDate, bookingMonth, selectionForService, toggleBookingDate, validBookingSelection, recurringBookingDates, toggleCrecheWeekday, weekdayForDate, weekdaysForDates } from '../design/booking';
import { buildBookingCart } from '../../viewmodels/booking-cart';
import { createPetDraft } from '../../viewmodels/pet-draft';
import { registerTutorPet } from '../../models/pet-registration';
import { loadTutorPets } from '../../models/tutor-pets';
import { loadCurrentUserName } from '../../models/current-user';
import { availableBookingDates, bookingPets, bookingBudget, matchingBookingService, saveTutorBooking } from '../../api/tutor-booking';
import { validatePetForm, validatePetPhoto } from '../../models/pet-validation';
import { unconfiguredHolidayCalendar } from '../../models/holidays';
import { clearBookingDraft, draftDatesForCalendar, markBookingDraftReady, readBookingDraft, saveBookingDraft } from '../../viewmodels/booking-draft';
import { structureBookingDesign } from '../design/structure-booking';
import { structureActivities, structureActivityDesign } from '../design/structure-activities';
import { ActivityCatalogDetails } from '../components/ActivityCatalogDetails';
import { isMonitorRecord, monitorRecordKey, monitorRecordValues, monitorRecordDesign, monitorRecordLocked, monitorOptions, integratedMonitorDesign } from '../design/monitor-records';
import { useMonitorFeed } from '../../viewmodels/use-monitor-feed';
import { usePetDiary } from '../../viewmodels/use-pet-diary';
import { integratedPetDiaryDesign } from '../design/pet-diary';
import { presenceDay } from '../../viewmodels/use-presence';
import { dashboardDesign, dashboardFormDesign } from '../design/dashboard';
import { useDashboard } from '../../viewmodels/use-dashboard';
import { useManagementCalendar } from '../../viewmodels/use-management-calendar';
import { managementCalendarDesign } from '../design/management-calendar';
import { ManagementCalendarDialogs } from '../components/ManagementCalendar';
import { checkInFeedDesign, diaryActionsDesign } from '../design/presentation-adjustments';
import { presenceDesign } from '../design/presence';
import { usePresence } from '../../viewmodels/use-presence';
import { useDailyActivities } from '../../viewmodels/use-daily-activities';
import { dailyActivitiesDesign } from '../design/daily-activities';
import { findDesignNode } from '../design/structure-booking';
import { usePetHealthCatalog } from '../../models/pet-health-catalog';
import { PetCatalogDialog } from '../components/PetCatalogDialog';
import { addValidityToVaccineRecord, petInsuranceField, vaccineValidityField } from '../design/pet-health';
import { useTutorPets } from '../../viewmodels/use-tutor-pets';
import { screens } from './catalog';
import { createAuthViewModel } from '../../viewmodels/auth';
import { registrationDesign } from '../design/auth';
import { prototypeOperationBlock, recordIdentityUnavailable, monitorDataUnavailable, presenceDataUnavailable } from '../../viewmodels/prototype-safety';
const imports = import.meta.glob('../design/*.json');
const load = async (key) => (await imports[`../design/${key}.json`]()).default;
const dialogOperations = { userCreate: 'saveUser', userEdit: 'saveUser', createGoal: 'saveGoal', editGoal: 'saveGoal', loadedGoal: 'saveGoal', revenue: 'saveRevenue', linkPlan: 'saveLink', createPlan: 'savePlan', editPlan: 'savePlan', petEdit: 'savePet' };
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
export function ScreenPage({ id, preview = false, api, session, holidayCalendar = unconfiguredHolidayCalendar, dashboardSource, calendarSource, petHealthCatalogSource, tutorScheduleSource, onSession }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        setCurrentUser(null);
        if (!session?.token || preview) return;
        const controller = new AbortController();
        loadCurrentUserName(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal)
            .then(name => { if (!controller.signal.aborted) setCurrentUser({ token: session.token, name }); })
            .catch(() => {});
        return () => controller.abort();
    }, [session?.token, session?.id, preview]);
    const editPetParam = id === 'TL06' && !preview ? new URLSearchParams(location.search).get('editar') : null;
    const editPetId = editPetParam === null ? undefined : Number(editPetParam);
    const [editPetReady, setEditPetReady] = useState(false);
    const mobile = useMobile();
    const dashboard = useDashboard(id === 'TL13', preview, api, dashboardSource);
    const managementCalendar = useManagementCalendar(id === 'TL14', preview, api, calendarSource);
    const petHealthCatalog = usePetHealthCatalog(id === 'TL06' && preview, preview, petHealthCatalogSource);
    const tutorPets = useTutorPets(id === 'TL05', session);
    const presence = usePresence(id === 'TL11' && !preview, session);
    const dailyActivities = useDailyActivities(id === 'TL12' && !preview, session);
    const monitorPetId = Number(location.state?.monitorContext?.idPet || new URLSearchParams(location.search).get('pet'));
    const monitorFeed = useMonitorFeed(id === 'TL10' && !preview, monitorPetId, session);
    const diaryPetId = Number(new URLSearchParams(location.search).get('pet'));
    const diaryDay = new URLSearchParams(location.search).get('data') || presenceDay();
    const petDiary = usePetDiary(id === 'TL07' && !preview, diaryPetId, diaryDay, session);
    const [design, setDesign] = useState(null);
    const [bookingDesign, setBookingDesign] = useState(null);
    const applyingDraft = useRef(null);
    const bookingScreen = id === 'TL03' || id === 'TL09';
    const [dialogDesign, setDialogDesign] = useState(null);
    const [dialog, setDialog] = useState('');
    const [menu, setMenu] = useState(false);
    const [fields, setFields] = useState({});
    const [dialogFields, setDialogFields] = useState({});
    const [step, setStep] = useState(0);
    const [dialogStep, setDialogStep] = useState(0);
    const [day, setDay] = useState(0);
    const [selectedDates, setSelectedDates] = useState([]);
    const [crecheWeekdays, setCrecheWeekdays] = useState([]);
    const [service, setService] = useState('Hotel');
    const [pets, setPets] = useState(['Thor', 'Mel', 'Luke']);
    const [monthOffset, setMonthOffset] = useState(() => id === 'TL09' || id === 'TL03' && !preview ? (new Date().getFullYear() - 2026) * 12 + new Date().getMonth() - 7 : 0);
    const [availability, setAvailability] = useState(null);
    const [availabilityError, setAvailabilityError] = useState('');
    const [bookingPetList, setBookingPetList] = useState([]);
    const [bookingServices, setBookingServices] = useState([]);
    const [budgetState, setBudgetState] = useState(null);
    const [budgetError, setBudgetError] = useState('');
    const bookingInFlight = useRef(false);
    const [bookingRefresh, setBookingRefresh] = useState(0);
    const availabilityKey = `${service}:${monthOffset}:${pets.length}`;
    const bookingBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    useEffect(() => {
        if (id !== 'TL03' || preview) return;
        const controller = new AbortController();
        setBookingPetList([]);
        setPets([]);
        bookingPets(bookingBaseUrl, session, controller.signal).then(data => {
            if (!controller.signal.aborted) setBookingPetList(data);
        }).catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
        return () => controller.abort();
    }, [id, preview, session?.token]);
    useEffect(() => {
        if (!bookingScreen || preview)
            return;
        const controller = new AbortController();
        const category = categoryForService(service);
        const date = new Date(2026, 7 + monthOffset, 1);
        setAvailability(null);
        setAvailabilityError('');
        Promise.all([
            id === 'TL09' ? Promise.resolve([]) : loadActiveServices(bookingBaseUrl, category, controller.signal, undefined, session?.token),
            loadBookingAvailability(bookingBaseUrl, category, date.getFullYear(), date.getMonth() + 1, controller.signal, undefined, session?.token),
        ]).then(([services, dates]) => {
            if (controller.signal.aborted)
                return;
            if (id !== 'TL09' && !services.length) {
                setAvailabilityError('Não há serviços ativos nesta categoria.');
                return;
            }
            setBookingServices(services);
            const available = availableBookingDates(dates, id === 'TL09' ? 1 : pets.length);
            setAvailability({ key: availabilityKey, available });
        }).catch(() => { if (!controller.signal.aborted)
            setAvailabilityError('Não foi possível consultar a disponibilidade.'); });
        return () => controller.abort();
    }, [id, bookingScreen, preview, service, monthOffset, pets.length, session?.token, bookingRefresh]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(location.state?.message || '');
    const [activityIndex, setActivityIndex] = useState(0);
    const [monitorSaved, setMonitorSaved] = useState({});
    const monitorSavedRef = useRef({});
    useEffect(() => {
        monitorSavedRef.current = {};
        setMonitorSaved({});
        setFields(values => Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith('monitor.'))));
    }, [id, monitorPetId, session?.token, monitorFeed.day]);
    useEffect(() => { setActivityIndex(0); }, [id]);
    const [confirmAction, setConfirmAction] = useState(null);
    const [allergies, setAllergies] = useState([]);
    const [allergyDraft, setAllergyDraft] = useState([]);
    const [allergyDescription, setAllergyDescription] = useState('');
    const [repeats, setRepeats] = useState({});
    const [petRecords, setPetRecords] = useState({ vacinas: [0], medicamentos: [0] });
    const petRecordSequence = useRef(1);
    const [petErrors, setPetErrors] = useState({});
    const removePetRecord = (kind, recordId) => {
        setPetRecords(records => ({ ...records, [kind]: records[kind].filter(id => id !== recordId) }));
        setFields(values => Object.fromEntries(Object.entries(values).filter(([key]) => !key.startsWith(`${kind}.${recordId}.`))));
        setPetErrors(errors => Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(`${kind}.${recordId}.`))));
    };
    const formRef = useRef(null);
    const modalFormRef = useRef(null);
    const fileRef = useRef(null);
    const photoRef = useRef(null);
    const [photo, setPhoto] = useState('');
    const [petPhoto, setPetPhoto] = useState(null);
    useEffect(() => {
        let canceled = false;
        setDesign(null);
        setStep(0);
        setFields({});
        setDialog('');
        setMessage('');
        setMenu(false);
        setRepeats({});
        setDay(id === 'TL14' ? 15 : 13);
        setService('Hotel');
        setPets(id === 'TL03' && !preview ? [] : ['Thor', 'Mel', 'Luke']);
        setMonthOffset((id === 'TL09' || id === 'TL03' && !preview) ? (new Date().getFullYear() - 2026) * 12 + new Date().getMonth() - 7 : 0);
        setAllergies([]);
        setPhoto('');
        setSelectedDates(id === 'TL03' && !preview ? [] : ['2026-08-13']);
        if (id === 'TL09')
            setSelectedDates([]);
        setCrecheWeekdays([]);
        setBookingDesign(null);
        applyingDraft.current = null;
        const draft = id === 'TL03' ? readBookingDraft() : null;
        Promise.all([load(id), id === 'TL09' ? load('TL03') : Promise.resolve(null)]).then(([data, reference]) => {
            if (canceled)
                return;
            setDesign(id === 'TL04' ? registrationDesign(data) : data);
            setBookingDesign(reference);
            if (id === 'TL03' && draft?.phase === 'ready') {
                setSelectedDates(draftDatesForCalendar(draft, data.desktop));
                setService(draft.service);
                setCrecheWeekdays(draft.service === 'Creche' ? draft.weekdays : []);
                setMonthOffset(draft.monthOffset);
                setDay(Number(draft.dates.at(-1)?.slice(-2)) || 0);
                applyingDraft.current = draft;
            }
        }).catch(() => { if (!canceled)
            setMessage('Não foi possível carregar esta tela.'); });
        window.scrollTo(0, 0);
        return () => { canceled = true; };
    }, [id]);
    useEffect(() => {
        setEditPetReady(false);
        if (editPetId === undefined) return;
        const controller = new AbortController();
        setBusy(true);
        setFields({});
        loadTutorPets(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, controller.signal).then(pets => {
            if (controller.signal.aborted) return;
            const pet = pets.find(pet => pet.idPet === editPetId);
            if (!pet) throw new Error('Pet não encontrado na sua lista.');
            setFields({ nome: pet.nome, raca: pet.raca || '', sexo: pet.sexo || '', castrado: pet.castrado === true ? 'Sim' : pet.castrado === false ? 'Não' : '', nascimento: pet.dataNascimento?.split('-').reverse().join('/') || '', veterinario: pet.veterinario || '', contato: pet.telefoneVeterinario || '', convenio: typeof pet.convenio === 'boolean' ? pet.convenio ? 'Sim' : 'Não' : '', obs: pet.observacao || '', 'relacionamento-com-outros-pets': pet.relacaoComOutros || '' });
            setEditPetReady(true);
            setMessage('Edição do pet: confira os dados e preencha os campos não retornados pela consulta. Vacinas, alergias e medicações serão substituídas por listas vazias.');
        }).catch(error => { if (!controller.signal.aborted) setMessage(error.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
        return () => controller.abort();
    }, [editPetId, session?.token, session?.id]);
    const bookingReference = id === 'TL09' ? bookingDesign?.desktop : design?.desktop;
    const bookingDates = service === 'Creche' ? recurringBookingDates(bookingReference, crecheWeekdays, monthOffset) : selectedDates;
    useEffect(() => {
        const draft = applyingDraft.current;
        if (id !== 'TL03' || !design || !draft || service !== draft.service || monthOffset !== draft.monthOffset)
            return;
        const expected = draftDatesForCalendar(draft, design.desktop);
        if (JSON.stringify(selectedDates) !== JSON.stringify(expected) || JSON.stringify(crecheWeekdays) !== JSON.stringify(draft.service === 'Creche' ? draft.weekdays : []))
            return;
        // Clear only after the destination has committed the restored selection.
        clearBookingDraft(draft.token);
        applyingDraft.current = null;
    }, [id, design, service, monthOffset, selectedDates, crecheWeekdays]);
    const selectedBookingService = matchingBookingService(bookingServices, categoryForService(service), crecheWeekdays.length);
    const budgetKey = JSON.stringify([session?.token, service, selectedBookingService?.id, pets, bookingDates]);
    useEffect(() => {
        if (id !== 'TL03' || preview) return;
        const controller = new AbortController();
        setBudgetState(null);
        setBudgetError('');
        if (!pets.length || !bookingDates.length) return;
        if (!selectedBookingService) {
            setBudgetError('Não há um serviço único no backend correspondente ao serviço e à frequência selecionados.');
            return;
        }
        if (!availability || availability.key !== availabilityKey || bookingDates.some(date => !availability.available.has(date))) {
            return;
        }
        bookingBudget(bookingBaseUrl, session, selectedBookingService, pets.map(Number), bookingDates, controller.signal).then(data => {
            if (!controller.signal.aborted) setBudgetState({ key: budgetKey, data });
        }).catch(error => { if (!controller.signal.aborted) setBudgetError(error.message); });
        return () => controller.abort();
    }, [id, preview, budgetKey, availability]);
    const currentBudget = budgetState?.key === budgetKey ? budgetState.data : null;
    useEffect(() => {
        if (id === 'TL03' && !preview && budgetError) setMessage(budgetError);
    }, [id, preview, budgetError]);
    const cart = id === 'TL03' && !preview ? {
        items: [], petCount: pets.length, totalCents: currentBudget ? Math.round(currentBudget.valorTotal * 100) : 0,
        subtotalPerPetCents: currentBudget && pets.length ? Math.round(currentBudget.valorTotal * 100 / pets.length) : 0,
        dates: currentBudget?.datasUtilizacao || bookingDates, pending: !currentBudget, error: budgetError,
    } : buildBookingCart({ service, dates: bookingDates, frequency: crecheWeekdays.length, month: bookingMonth(monthOffset), petCount: pets.length, holidays: holidayCalendar });
    const selectWeekday = (weekday) => {
        if (weekday === 0)
            return;
        if (!crecheWeekdays.includes(weekday) && crecheWeekdays.length === 6) {
            setMessage('A Creche permite até seis dias da semana.');
            return;
        }
        const next = toggleCrecheWeekday(crecheWeekdays, weekday);
        if (next.length > crecheWeekdays.length && !recurringBookingDates(bookingReference, [weekday], monthOffset).length)
            return;
        setCrecheWeekdays(next);
    };
    useEffect(() => () => { if (photoRef.current)
        URL.revokeObjectURL(photoRef.current); }, []);
    const go = useCallback((screenId) => {
        const screen = screens.find(s => s.id === screenId);
        if (screen) {
            const next = () => navigate(preview ? `/prototipo/${screen.id}` : screen.path);
            if (id === 'TL14')
                managementCalendar.requestLeave(next);
            else
                next();
        }
    }, [navigate, preview, id, managementCalendar.requestLeave]);
    const close = useCallback(() => { setDialog(''); setDialogDesign(null); setConfirmAction(null); }, []);
    const closeMenu = useCallback(() => setMenu(false), []);
    const openDialog = async (key) => {
        // No listing source links these design examples to domain entities.
        // Do not open a seeded form for a different record or manufacture an ID.
        if (['petEdit', 'editPlan', 'userEdit'].includes(key)) {
            setMessage(recordIdentityUnavailable);
            return;
        }
        setMessage('');
        setDialogStep(0);
        setDialog(key);
        setDialogDesign(null);
        setDialogFields({});
        if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(key))
            dashboard.begin(key);
        if (key === 'allergies') {
            setAllergyDraft([...allergies]);
            setAllergyDescription('');
        }
        if (!['confirm', 'allergies', 'details', 'profile'].includes(key)) {
            try {
                const data = await load(key);
                setDialogDesign(data);
                if (['petEdit', 'userEdit', 'editPlan', 'loadedGoal'].includes(key)) {
                    const values = {};
                    const seed = (n) => {
                        if (/^Campo$|^Campo /.test(n.name || '')) {
                            const kids = nodes(n);
                            const label = content(kids[0] || '');
                            let value = content(kids.find(c => c.name === 'Entrada') || '');
                            if (value && !/Selecione|Informe|Nome do|dd\/mm|R\$ 0|prescrita|Conte|Como seu/.test(value)) {
                                if (/^\d{2}\/\d{2}\/\d{4}$/.test(value))
                                    value = value.split('/').reverse().join('-');
                                if (/Valor/.test(label))
                                    value = value.replace(/R\$\s*/, '').replaceAll('.', '').replace(',', '.');
                                values[fieldKey(label)] = value;
                            }
                        }
                        nodes(n).forEach(seed);
                    };
                    seed(data.desktop);
                    setDialogFields(values);
                }
            }
            catch {
                setMessage('Não foi possível carregar esta tela.');
            }
        }
    };
    const validate = (allPetFields = false) => {
        const form = dialog ? modalFormRef.current : formRef.current;
        if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog)) {
            const keys = form ? Array.from(form.querySelectorAll('input[name], select[name]')).map(input => input.name) : [];
            return !Object.keys(dashboard.validate(keys)).length;
        }
        if (id === 'TL06' && !dialog) {
            const registrationFields = preview ? fields : Object.fromEntries(Object.entries(fields).filter(([key]) => !key.startsWith('alergia-')));
            const errors = validatePetForm(registrationFields, preview ? petRecords : { vacinas: [], medicamentos: [] }, !preview);
            const stepKeys = [['nome', 'nascimento', 'raca', 'sexo', 'castrado', 'convenio'], ['veterinario', 'contato', 'relacionamento-com-outros-pets', 'obs'], ['vacinas.'], ['alergia-'], ['medicamentos.']][step];
            const relevant = allPetFields || !mobile || step === 5 ? errors : Object.fromEntries(Object.entries(errors).filter(([key]) => stepKeys?.some(prefix => key === prefix || key.startsWith(prefix))));
            setPetErrors(relevant);
            if (Object.keys(relevant).length) {
                if (mobile && allPetFields) {
                    const key = Object.keys(relevant)[0];
                    setStep(key.startsWith('vacinas.') ? 2 : key.startsWith('alergia-') ? 3 : key.startsWith('medicamentos.') ? 4 : ['veterinario', 'contato', 'relacionamento-com-outros-pets', 'obs'].includes(key) ? 1 : 0);
                }
                setMessage('Confira os campos indicados antes de continuar.');
                return false;
            }
            return true;
        }
        if (!form?.reportValidity())
            return false;
        const values = dialog ? dialogFields : fields;
        if ((id === 'TL04' || dialog === 'userCreate') && values.senha !== values['confirmacao-de-senha']) {
            setMessage('Confira a confirmação de senha.');
            return false;
        }
        return true;
    };
    const run = async (operation, needsValidation = false) => {
        if (operation === 'savePet' && editPetId !== undefined && !editPetReady) {
            setMessage('Aguarde a consulta do pet ou volte para Meus Pets para tentar novamente.');
            return;
        }
        const integratedBooking = operation === 'book' && id === 'TL03' && !preview;
        const block = integratedBooking ? null : prototypeOperationBlock(operation, dialog);
        if (block) {
            setMessage(block);
            return;
        }
        if (busy || integratedBooking && bookingInFlight.current || needsValidation && !validate(operation === 'savePet'))
            return;
        if (operation === 'book' && ((!availability || availability.key !== availabilityKey || bookingDates.some(date => !availability.available.has(date))) || !integratedBooking && !validBookingSelection(design?.desktop, bookingDates, service) || service === 'Creche' && (!crecheWeekdays.length || crecheWeekdays.length > 6))) {
            setMessage('Selecione uma data disponível.');
            return;
        }
        if (operation === 'book' && (!service || !bookingDates.length || !pets.length)) {
            setMessage('Selecione o serviço, a data e os pets.');
            return;
        }
        if (integratedBooking && (!selectedBookingService || !currentBudget)) {
            setMessage('Aguarde o orçamento do serviço selecionado antes de agendar.');
            return;
        }
        if (integratedBooking) bookingInFlight.current = true;
        setBusy(true);
        setMessage('');
        try {
            const petDraft = operation === 'savePet' ? createPetDraft(dialog ? dialogFields : fields, allergies, id === 'TL06' && !dialog ? petRecords : undefined) : null;
            if (petDraft && id === 'TL06' && !dialog && petPhoto)
                petDraft.photo = petPhoto;
            // Only the creation form/draft is sent. Never attach unrelated pet names,
            // design targets or the prototype's day/service to another operation.
            const result = integratedBooking
                ? await saveTutorBooking(bookingBaseUrl, session, selectedBookingService, pets.map(Number), bookingDates)
                : operation === 'savePet' && id === 'TL06' && !dialog && !preview
                ? await registerTutorPet(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080', session, petDraft, undefined, undefined, editPetId)
                : await api.execute(operation, petDraft || (dialog ? dialogFields : fields));
            setMessage(result.message);
            if (operation === 'book') {
                clearBookingDraft();
                await openDialog('confirmation');
                setMessage(result.message);
                setSelectedDates([]);
                setCrecheWeekdays([]);
                setBudgetState(null);
                setBookingRefresh(value => value + 1);
            }
            else if (operation === 'register')
                go('TL02');
            else if (operation === 'savePet')
                go('TL05');
            else
                close();
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.');
            if (integratedBooking) setBookingRefresh(value => value + 1);
        }
        finally {
            if (integratedBooking) bookingInFlight.current = false;
            setBusy(false);
        }
    };
    const action = (label, node, ancestors) => {
        if (id === 'TL12' && !preview) {
            if (label === 'CONCLUÍDOS') {
                dailyActivities.toggleCompleted();
                return;
            }
            if (label === 'Concluído') {
                const activity = ancestors.findLast(parent => parent.dailyActivity)?.dailyActivity;
                if (activity) void dailyActivities.complete(activity.idAtividadeDoDia);
                return;
            }
            if (label === 'Detalhes' || label === 'Ver detalhes') {
                const pet = ancestors.findLast(parent => parent.dailyPet)?.dailyPet;
                const activity = ancestors.findLast(parent => parent.dailyActivity)?.dailyActivity;
                if (pet) dailyActivities.openPet(pet);
                else if (activity) dailyActivities.expand(activity.idAtividadeDoDia);
                return;
            }
        }
        if (id === 'TL11' && !preview && ['Registrar entrada', 'Registrar saída'].includes(label)) {
            const pet = ancestors.findLast(parent => parent.presencePet)?.presencePet;
            presence.open(pet, label === 'Registrar entrada' ? 'checkIn' : 'checkOut');
            return;
        }
        if (/^Legal!?$/.test(label)) {
            close();
            return;
        }
        if (label === 'Editar pet integrado') {
            navigate(`/tutor/pets/novo?editar=${node.editPetId}`);
            return;
        }
        if (id === 'TL11' && label === 'Feed do Monitor') {
            const panel = ancestors.findLast(node => node.name === 'Painel' && !!findDesignNode(node, 'Identificação do auluno'));
            const identity = panel && findDesignNode(panel, 'Identificação do auluno');
            const text = identity ? content(identity).trim() : '';
            const petName = text.split(/\s+Pet\s+\d/)[0].trim();
            const pet = panel?.presencePet;
            navigate(preview ? '/prototipo/TL10' : pet ? `/monitor/feed?pet=${pet.idPet}` : '/monitor/feed', { state: { monitorContext: { petName: pet?.nomePet || petName, idPet: pet?.idPet, idAgendamento: pet?.idAgendamento, illustrative: !pet } } });
            return;
        }
        if (id === 'TL14' && label === 'Adicionar atividade') {
            managementCalendar.addActivity();
            return;
        }
        if (id === 'TL13' && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog) && ['Salvar', 'Salvar alterações', 'Criar meta', 'Salvar meta'].includes(label)) {
            void dashboard.save().then(result => {
                if (result.message)
                    setMessage(result.message);
                if (result.success)
                    close();
                else if (mobile && Object.keys(result.errors).length) {
                    const key = Object.keys(result.errors)[0];
                    const firstStep = dialogDesign?.steps.findIndex(step => {
                        const visit = (node) => {
                            const label = nodes(node)[0];
                            const field = label && fieldKey(content(label));
                            if ((field === key || key === 'mes-cadastrado' && field === 'mes') && nodes(node).some(child => /Entrada|Controle/.test(child.name || '')))
                                return true;
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
            if (!record || busy || monitorFeed.saving || monitorFeed.loading)
                return;
            const key = monitorRecordKey(record);
            if (monitorRecordLocked(record, monitorSavedRef.current[key])) {
                setMessage(preview ? 'Registro protegido: não é permitido sobrescrever este registro. Na prévia, o armazenamento permanece somente em memória.' : 'Registro protegido: não é permitido sobrescrever este registro.');
                return;
            }
            const values = monitorRecordValues(record, fields);
            if (Object.entries(values).some(([field, value]) => monitorOptions[field] && !monitorOptions[field].includes(value))) {
                setMessage('Selecione uma opção válida para este registro.');
                return;
            }
            if (preview && import.meta.env.DEV) {
                monitorSavedRef.current = { ...monitorSavedRef.current, [key]: { values: { ...values }, local: true } };
                setMonitorSaved(monitorSavedRef.current);
                setMessage('Registro bloqueado para alterações após salvar somente na prévia, em memória. Não foi salvo no servidor.');
                return;
            }
            if (!record.monitorRecord || !monitorFeed.data) {
                setMessage(monitorFeed.error || 'Aguarde a consulta da rotina do pet.');
                return;
            }
            void monitorFeed.save(record.monitorRecord, values).then(saved => {
                if (!saved) return;
                monitorSavedRef.current = { ...monitorSavedRef.current, [key]: { values: { ...values } } };
                setMonitorSaved(monitorSavedRef.current);
                setMessage('Registro salvo no sistema.');
            }).catch(error => setMessage(error.message));
            return;
        }
        if (id === 'TL09' && (label === 'Atividade anterior' || label === 'Próxima atividade')) {
            setActivityIndex(index => Math.max(0, Math.min(structureActivities.length - 1, index + (label === 'Próxima atividade' ? 1 : -1))));
            return;
        }
        if (label === 'ENTRAR') {
            go('TL02');
            return;
        }
        if (label === 'CADASTRAR') {
            go('TL04');
            return;
        }
        if (label === 'Menu') {
            setMenu(v => !v);
            return;
        }
        if (label === 'Assistente') {
            void openDialog('assistant');
            return;
        }
        if (label.startsWith('Carrossel ') || ['←', '→'].includes(label) && ancestors.some(n => n.name === 'Navegação do carrossel')) {
            const carousel = ancestors.findLast(isCarousel);
            if (carousel)
                setFields(f => ({ ...f, [`carousel-${carousel.id}`]: String(Number(f[`carousel-${carousel.id}`] || 0) + (label.endsWith('anterior') || label === '←' ? -1 : 1)) }));
            return;
        }
        if (label === 'Fechar' || label === 'Entendi' || label === 'Voltar para Meus Pets') {
            close();
            if (label === 'Voltar para Meus Pets')
                go('TL05');
            return;
        }
        if (label === 'Cancelar') {
            if (dialog)
                close();
            else {
                if (id === 'TL03') {
                    clearBookingDraft();
                    setSelectedDates([]);
                    setCrecheWeekdays([]);
                }
                go('TL05');
            }
            return;
        }
        if (label === 'Voltar') {
            if (mobile && (dialog ? dialogStep : step) > 0) {
                dialog ? setDialogStep(s => s - 1) : setStep(s => s - 1);
                return;
            }
            if (dialog) {
                close();
                return;
            }
            go(['TL10', 'TL12'].includes(id) ? 'TL11' : 'TL05');
            return;
        }
        if (/Continuar|Avançar|Próximo/.test(label)) {
            if (!validate())
                return;
            if (id === 'TL03' && !dialog && mobile && step === 1 && (!availability || availability.key !== availabilityKey || bookingDates.some(date => !availability.available.has(date)))) {
                setMessage(availabilityError || 'Aguarde a consulta de disponibilidade.');
                return;
            }
            if (id === 'TL03' && !dialog && mobile && step === 1 && !validBookingSelection(design?.desktop, bookingDates, service)) {
                setMessage('Selecione uma data disponível.');
                return;
            }
            if (dialog)
                setDialogStep(s => Math.min(s + 1, (dialogDesign?.steps.length || 1) - 1));
            else
                setStep(s => Math.min(s + 1, (design?.steps.length || 1) - 1));
            window.scrollTo(0, 0);
            return;
        }
        if (label.startsWith('Dia ')) {
            const selectedDay = parseInt(label.slice(4));
            if (bookingScreen && (!availability || availability.key !== availabilityKey || !availability.available.has(bookingDate(selectedDay, monthOffset))))
                return;
            if (bookingScreen) {
                if (service === 'Creche')
                    selectWeekday(weekdayForDate(bookingDate(selectedDay, monthOffset)));
                else
                    setSelectedDates(dates => toggleBookingDate(dates, bookingDate(selectedDay, monthOffset), service));
            }
            setDay(selectedDay);
            return;
        }
        if (['Creche', 'Hotel', 'DayUse'].includes(label)) {
            if (bookingScreen && label !== service) {
                if (label === 'Creche') {
                    const weekdays = weekdaysForDates(bookingDates, monthOffset);
                    if (weekdays.length > 6)
                        setMessage('A Creche permite até seis dias da semana.');
                    setCrecheWeekdays(weekdays.slice(0, 6));
                }
                else
                    setSelectedDates(selectionForService(bookingDates, label));
            }
            setService(label);
            return;
        }
        if (bookingScreen && service === 'Creche' && /^Semana [0-6]$/.test(label)) {
            selectWeekday(Number(label.slice(7)));
            return;
        }
        if (label === 'Todos os pets') {
            const all = id === 'TL03' && !preview ? bookingPetList.map(pet => String(pet.idPet)) : ['Thor', 'Mel', 'Luke'];
            setPets(p => p.length === all.length ? [] : all);
            return;
        }
        if (label.startsWith('Booking pet ')) {
            const pet = label.slice(12);
            setPets(list => list.includes(pet) ? list.filter(item => item !== pet) : [...list, pet]);
            return;
        }
        if (/^Pet (Thor|Mel|Luke)$/.test(label)) {
            const pet = label.slice(4);
            setPets(list => list.includes(pet) ? list.filter(p => p !== pet) : [...list, pet]);
            return;
        }
        if (label === '←' || label === '→') {
            setMonthOffset(m => m + (label === '→' ? 1 : -1));
            return;
        }
        if (label === '×') {
            if (ancestors.some(n => /Pet selecionado/.test(n.name || ''))) {
                const pet = ['Thor', 'Mel', 'Luke'].find(p => ancestors.some(n => content(n).startsWith(p)));
                if (pet)
                    setPets(list => list.filter(p => p !== pet));
            }
            else if (dialog)
                close();
            else {
                setConfirmAction('saveActivity');
                void openDialog('confirm');
            }
            return;
        }
        if (label === 'Entrar') {
            if (id !== 'TL02') {
                go('TL02');
                return;
            }
            if (!validate() || busy)
                return;
            setBusy(true);
            setMessage('');
            Promise.resolve().then(() => createAuthViewModel(api).login(fields)).then(session => {
                onSession(session);
                const bookingFlow = session.profile === 'tutor' && markBookingDraftReady();
                go(bookingFlow ? 'TL03' : session.profile === 'tutor' ? 'TL05' : session.profile === 'monitor' ? 'TL11' : 'TL13');
            }).catch(error => setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.')).finally(() => setBusy(false));
            return;
        }
        if (label === 'Cadastrar') {
            if (id !== 'TL04')
                go('TL04');
            else if (!busy && validate()) {
                setBusy(true);
                setMessage('');
                Promise.resolve().then(() => createAuthViewModel(api).register(fields)).then(() => {
                    navigate('/entrar', { state: { message: 'Cadastro realizado! Entre com seu e-mail e senha.' } });
                }).catch(error => setMessage(error.message || 'Não foi possível cadastrar.')).finally(() => setBusy(false));
            }
            return;
        }
        if (id === 'TL09' && (label === 'Agendar' || label === 'Quero agendar')) {
            saveBookingDraft({ service: service, dates: bookingDates, weekdays: service === 'Creche' ? crecheWeekdays : [], monthOffset }, session?.profile === 'tutor');
            navigate(session?.profile === 'tutor' ? '/tutor/agendamento' : '/entrar');
            return;
        }
        if (label === 'Agendar') {
            if (id === 'TL03')
                void run('book', true);
            else
                go('TL03');
            return;
        }
        if (label === 'Agendar visita') {
            go('TL03');
            return;
        }
        if (label === 'Como funciona') {
            go('TL08');
            return;
        }
        if (label === 'Adicionar Pet') {
            go('TL06');
            return;
        }
        if (label === 'Ver diário') {
            const petId = node.diaryPetId || ancestors.findLast(parent => parent.diaryPetId)?.diaryPetId;
            if (preview) go('TL07');
            else navigate(`/tutor/diario${petId ? `?pet=${petId}` : ''}`);
            return;
        }
        if (/Já tem|Clique aqui/.test(label)) {
            go('TL02');
            return;
        }
        if (/Não tem login/.test(label)) {
            go('TL04');
            return;
        }
        if (/Conheça|NOSSO ESPAÇO|Saiba mais/.test(label)) {
            go(/ESPAÇO|espaço|estrutura/i.test(label) ? 'TL09' : 'TL08');
            return;
        }
        const nav = screens.find(s => s.name.toLowerCase() === label.toLowerCase() || s.id === 'TL08' && label === 'SOBRE' || s.id === 'TL01' && label === 'INÍCIO' || s.id === 'TL04' && label === 'CADASTRE-SE');
        if (nav && !['Criar meta', 'Editar meta'].includes(label)) {
            go(nav.id);
            return;
        }
        if (label === 'Meus Dados') {
            void openDialog('profile');
            return;
        }
        if (label === 'Criar usuário') {
            void openDialog('userCreate');
            return;
        }
        if (label === 'Criar Plano') {
            void openDialog('createPlan');
            return;
        }
        if (label === 'Vincular Plano') {
            void openDialog('linkPlan');
            return;
        }
        if (label === 'Adicionar receita') {
            void openDialog('revenue');
            return;
        }
        if (label === 'Criar meta' && !dialog) {
            void openDialog('createGoal');
            return;
        }
        if (label === 'Editar meta' && !dialog) {
            void openDialog('editGoal');
            return;
        }
        if (label === 'Selecionar meta') {
            void openDialog('loadedGoal');
            return;
        }
        if (label === 'Editar') {
            setMessage(recordIdentityUnavailable);
            return;
        }
        if (label === 'Excluir' || label === 'Desativar' || label === 'Ativar') {
            setConfirmAction(label === 'Excluir' ? id === 'TL17' ? 'deletePlan' : 'deletePet' : id === 'TL15' ? 'setUserActive' : id === 'TL16' ? 'setLinkActive' : 'setPlanActive');
            void openDialog('confirm');
            return;
        }
        if (label === 'Adicionar foto') {
            fileRef.current?.click();
            return;
        }
        if (label === 'Adicionar alergia') {
            if (id === 'TL06')
                petHealthCatalog.open('alergias', item => setAllergies(values => [...new Set([...values, item.name])]));
            else
                void openDialog('allergies');
            return;
        }
        if (id === 'TL06' && (label === 'Adicionar' || label === '+ Adicionar')) {
            const kind = ancestors.some(n => n.id === 'rGbzh' || n.name === 'Card · Vacinas tomadas') ? 'vacinas' : 'medicamentos';
            const recordId = petRecordSequence.current++;
            setPetRecords(records => ({ ...records, [kind]: [...records[kind], recordId] }));
            return;
        }
        if (label === 'Adicionar') {
            const section = ancestors.findLast(n => /Vacinas|Remédio/.test(n.name || ''));
            if (section)
                setRepeats(r => ({ ...r, [section.id]: (r[section.id] || 0) + 1 }));
            return;
        }
        if (label === 'Registrar entrada') {
            void run('checkIn');
            return;
        }
        if (label === 'Registrar saída') {
            void run('checkOut');
            return;
        }
        if (label === 'Concluído') {
            void run('completeActivity');
            return;
        }
        if (label === 'CONCLUÍDOS') {
            setFields(v => ({ ...v, filtro: v.filtro ? '' : 'concluidos' }));
            return;
        }
        if (label === 'Atividades') {
            go('TL12');
            return;
        }
        if (label === 'Detalhes' || label === 'Ver detalhes') {
            void openDialog('details');
            return;
        }
        if (label === 'Adicionar atividade') {
            void openDialog('details');
            return;
        }
        if (label === 'Alterar') {
            document.querySelector('input[type=number]')?.focus();
            return;
        }
        if (/Salvar|Criar meta/.test(label)) {
            void run(dialog ? dialogOperations[dialog] || 'saveRecord' : id === 'TL06' ? 'savePet' : id === 'TL14' ? 'saveCapacity' : 'saveRecord', true);
            return;
        }
        if (label === 'Enviar') {
            setMessage('O Assistente EcoMigo ainda depende de integração com o sistema.');
        }
    };
    const enhance = (node, inDashboardForm = false) => {
        if (['TL03', 'TL05', 'TL06', 'TL07', 'TL10', 'TL11', 'TL12'].includes(id) && !nodes(node).length && /^ÁREA (DO MONITOR|D[OA] TUTOR[A]?)(\s|$)/i.test(content(node).trim()))
            return { ...node, className: 'hidden', children: [] };
        const integrated = !preview && (['TL03', 'TL06', 'TL07', 'TL10', 'TL11', 'TL12'].includes(id) || id === 'TL13' && !dashboard.example || id === 'TL14' && !managementCalendar.example);
        if (integrated && !nodes(node).length && /dados ilustrativos|valor ilustrativo|composição dos grupos ilustrativa|leitura aproximada do wireframe|persona de exemplo/i.test(content(node)))
            return { ...node, className: 'hidden', children: [] };
        if (id === 'TL09' && bookingDesign) {
            const source = nodes(node);
            const calendar = source.find(child => ['a6sxP', 'aqBV3'].includes(child.id || ''));
            const action = source.find(child => ['pRYPM', 'QNBPU'].includes(child.id || ''));
            if (calendar && action) {
                const replacement = structureBookingDesign(calendar, bookingDesign, mobile, action);
                return { ...node, children: node.children?.flatMap(child => child === action ? [] : [typeof child === 'string' ? child : enhance(child === calendar ? replacement : child)]) };
            }
        }
        if (id === 'TL09' && bookingDesign && ['a6sxP', 'aqBV3'].includes(node.id || ''))
            return enhance(structureBookingDesign(node, bookingDesign, mobile));
        if (id === 'TL06' && !dialog && ['Registro de vacina', 'Registro de medicamento'].includes(node.name || ''))
            return { ...(node.name === 'Registro de vacina' ? addValidityToVaccineRecord(node) : node), id: node.name === 'Registro de vacina' ? 'pet-vacinas' : 'pet-medicamentos', name: 'Pet records' };
        if (id === 'TL06' && !dialog && (node.name === 'Listagem de alergias' || node.id === 'x2uAZ'))
            return { ...node, name: 'Pet allergies' };
        let children = node.children?.filter(c => !(id === 'TL13' && inDashboardForm && content(c).trim() === '×')).filter(c => id !== 'TL06' || typeof c === 'string' || !['e1u9df', 'uwuPj'].includes(c.id || '')).map(c => typeof c === 'string' ? c : enhance(c, inDashboardForm));
        if (id === 'TL03' && !preview && children) {
            const petTemplate = children.find(child => typeof child !== 'string' && (child.name === 'Pet selecionado' || /^(Thor|Mel|Luke) · selecionado$/.test(child.name || '')));
            if (petTemplate) {
                const mapPet = (entry, pet) => {
                    if (typeof entry === 'string') return entry;
                    const copy = { ...entry, id: `${entry.id || 'booking-pet'}-${pet.idPet}` };
                    const selected = pets.includes(String(pet.idPet));
                    if (entry.name === 'Foto do pet') return { ...copy, className: entry.className.replace(/bg-\[url\([^]*?\)\]/g, '') + ' bg-[var(--background)]', children: [] };
                    if (entry.name === 'Nome' || entry.name === 'Nome do pet' || ['Thor', 'Mel', 'Luke'].includes(content(entry).trim())) return { ...copy, children: [pet.nome] };
                    if (entry.name === 'Seleção individual' || entry.name === 'Texto' && content(entry).trim() === 'Selecionado') return { ...copy, children: [selected ? 'Selecionado' : 'Não selecionado'] };
                    if (entry.name === 'Rótulo' && /Thor|Mel|Luke/.test(content(entry))) return { ...copy, children: [`${selected ? '✓' : '○'} ${pet.nome}`] };
                    if (entry.name === 'Ação' && content(entry).trim() === '×') return { ...copy, children: [selected ? '×' : '+'] };
                    return { ...copy, children: entry.children?.map(child => mapPet(child, pet)) };
                };
                children = [...children.filter(child => typeof child === 'string' || !(child.name === 'Pet selecionado' || /^(Thor|Mel|Luke) · selecionado$/.test(child.name || ''))), ...bookingPetList.map(pet => ({ ...mapPet(petTemplate, pet), name: 'Booking pet', bookingPet: pet }))];
            }
        }
        if (id === 'TL06' && !dialog && (node.id === 'CUvkc' || node.name === 'Card · Identificação') && children) {
            const candidates = children.filter((child) => typeof child !== 'string').flatMap(child => [child, ...nodes(child)]);
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
            const templates = children.filter((child) => typeof child !== 'string' && fieldNames.includes(child.name || '') && nodes(child).some(n => n.name === 'Entrada'));
            const recordTemplates = kind === 'vacinas' ? [...templates, vaccineValidityField(templates.find(field => field.name === 'Data'))] : templates;
            let inserted = false;
            children = children.flatMap(child => {
                if (typeof child === 'string' || !templates.includes(child))
                    return [child];
                if (inserted)
                    return [];
                inserted = true;
                return [{ tag: 'div', id: `pet-${kind}`, name: 'Pet records', className: 'w-full', children: recordTemplates }];
            });
        }
        if (id === 'TL03' && node.id === 'IjVwX' && children) {
            const values = children.filter(child => typeof child !== 'string' && child.name === 'Valor previsto');
            const details = children.filter(child => typeof child === 'string' || child.name !== 'Valor previsto');
            children = [{ tag: 'h2', id: 'booking-summary-title', name: 'Título do resumo', className: 'booking-section-title font-interface text-[var(--brand)] w-full', children: ['Resumo do Agendamento'] }, ...values, ...details];
        }
        if (id === 'TL02')
            children = children?.map(child => typeof child === 'string' ? child.replace('acompanhar seus aumigos.', 'acompanhar seus pets.') : child);
        if (id === 'TL05' && node.name === 'Meus planos' && children) {
            const parts = children.filter((child) => typeof child !== 'string');
            const header = parts.find(child => child.name === 'Título e agendamento');
            const card = parts.find(child => child.name === 'Plano contratado');
            const schedule = parts.find(child => child.name === 'Ação');
            if (header && card) {
                const table = {
                    tag: 'div', id: `${card.id}-contents`, name: 'Plano contratado',
                    className: `box-border w-full h-fit flex flex-col${mobile ? ' gap-[20px]' : ''}`,
                    children: card.children,
                };
                children = [{ ...card, tag: 'section', name: 'Meus Planos • Card', children: [header, table, ...(schedule ? [schedule] : [])] }];
            }
        }
        if (id === 'TL03' && !mobile && node.id === 'PyCgJ') {
            let valuesCard;
            const removeValuesCard = child => {
                if (typeof child === 'string') return child;
                if (child.id === 'IjVwX') {
                    valuesCard = child;
                    return null;
                }
                return { ...child, children: child.children?.map(removeValuesCard).filter(item => item !== null) };
            };
            children = children?.map(removeValuesCard).filter(item => item !== null);
            if (valuesCard && children?.length) children = [children[0], ...children.slice(1), { ...valuesCard, tag: 'aside' }];
        }
        if (id === 'TL05' && node.name === 'Plano contratado') {
            const header = children?.filter(child => typeof child !== 'string' && child.name === 'Cabeçalho da tabela') || [];
            return { ...node, children: [...header, { tag: 'p', id: `${node.id}-unavailable`, name: 'Consulta de planos indisponível', className: 'w-full p-[16px] text-[16px]/[23px] text-[var(--text)] font-[Roboto,system-ui,sans-serif]', children: ['Não foi possível consultar seus planos: o backend ainda não disponibiliza essa consulta.'] }] };
        }
        if (repeats[node.id] && children) {
            const group = children.findLast(c => typeof c !== 'string' && c.name === 'Grupo de campos');
            if (group)
                for (let i = 0; i < repeats[node.id]; i++)
                    children = [...children, { ...group, id: `${group.id}-extra-${i}`, children: group.children?.map(c => typeof c === 'string' ? c : { ...c, id: `${c.id}-extra-${i}` }) }];
        }
        if (isCarousel(node)) {
            const offset = Number(fields[`carousel-${node.id}`] || 0);
            children = updateCarouselIndicators(rotateCarousel({ ...node, children }, offset), offset).children;
        }
        if (bookingScreen && node.name === 'Calendário de agosto') {
            const calendar = calendarForMonth({ ...node, children }, monthOffset);
            const decorate = (entry) => {
                if (typeof entry === 'string')
                    return entry;
                const date = calendarDay(entry);
                const blocked = date && (!availability || availability.key !== availabilityKey || !availability.available.has(bookingDate(date.day, monthOffset)));
                return { ...entry, ...(date && !preview ? { bookingUnavailable: !!blocked } : {}), className: date ? `${(entry.className || '').replace(/bg-\[#ffe8e0(?:ff)?\]/gi, '')} ${blocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}` : entry.className, children: entry.children?.map(decorate) };
            };
            const calendarChildren = calendar.children?.map(decorate) || [];
            if (id === 'TL09' && !preview && (!availability || availability.key !== availabilityKey))
                calendarChildren.push({ tag: 'p', name: 'Estado de disponibilidade', className: 'w-full', children: [availabilityError || 'Consultando datas disponíveis…'] });
            return { ...node, className: `${node.className} booking-calendar`, children: calendarChildren };
        }
        if (photo && /Foto do pet/.test(node.name || '') && !content(node))
            return { ...node, tag: 'img', src: photo, decorative: false };
        if (node.name === 'Vínculo' && fields.pesquisa && !content(node).toLowerCase().includes(fields.pesquisa.toLowerCase()))
            return { ...node, className: 'hidden', children: [] };
        if (id === 'TL09' && ['dxjWO', 'yqTjv'].includes(node.id || ''))
            return structureActivityDesign({ ...node, children }, activityIndex);
        if (id === 'TL10' && isMonitorRecord(node))
            return monitorRecordDesign({ ...node, children }, fields, monitorSaved[monitorRecordKey(node)]);
        if (id === 'TL07')
            return diaryActionsDesign({ ...node, children });
        if (id === 'TL11')
            return !preview ? presenceDesign(checkInFeedDesign({ ...node, children }), presence) : checkInFeedDesign({ ...node, children });
        if (id === 'TL12' && !preview && !dialog)
            return dailyActivitiesDesign({ ...node, children }, dailyActivities, currentUser?.token === session?.token ? currentUser?.name : undefined);
        if (id === 'TL14')
            return managementCalendarDesign({ ...node, children }, managementCalendar);
        if (id === 'TL13') {
            if (inDashboardForm && ['createGoal', 'editGoal', 'loadedGoal', 'revenue'].includes(dialog))
                return dashboardFormDesign({ ...node, children }, dashboard.mode, dashboard.values, dashboard.data);
            if (content(node).includes('Dados ilustrativos do wireframe') && !nodes(node).length)
                return { ...node, children: [dashboard.loading ? 'Carregando dados do dashboard…' : dashboard.loadError || (dashboard.example ? content(node) : 'Dados carregados pelo adaptador do dashboard.')] };
            return dashboardDesign({ ...node, children }, dashboard.data);
        }
        return { ...node, children };
    };
    const context = { screen: id, mobile, userRole: !preview ? { tutor: 'Tutor', monitor: 'Monitor', admin: 'Administrador' }[session?.profile] : undefined, userName: session?.token && !preview ? currentUser?.token === session.token ? currentUser.name : 'Minha conta' : undefined, bookingIntegrated: ['TL03', 'TL09'].includes(id) && !preview, bookingPetList, monitorSaved, modal: false, fields: dialog ? dialogFields : fields, setField: (key, value) => {
            if (id === 'TL10' && key.startsWith('monitor.') && monitorSavedRef.current[key.split('.')[1]])
                return;
            (dialog ? setDialogFields : setFields)(f => ({ ...f, [key]: value }));
            if (id === 'TL06' && !dialog)
                setPetErrors(errors => {
                    const updated = validatePetForm({ ...fields, [key]: value }, petRecords);
                    return Object.fromEntries(Object.keys(errors).filter(key => updated[key]).map(key => [key, updated[key]]));
                });
        }, tutorPets: id === 'TL05' ? tutorPets : undefined, petHealthCatalog: id === 'TL06' ? petHealthCatalog : undefined, managementCalendar: id === 'TL14' ? managementCalendar : undefined, dashboard: id === 'TL13' ? dashboard : undefined, activityIndex, petRecords, petErrors, removePetRecord, petAllergies: allergies, setPetAllergies: setAllergies, action, day, selectedDates: bookingDates, crecheWeekdays, cart, removeDate: (date) => { if (service !== 'Creche')
            setSelectedDates(dates => dates.filter(selected => selected !== date)); }, service, pets, busy: busy || monitorFeed.saving || id === 'TL10' && !preview && (monitorFeed.loading || !monitorFeed.data) || id === 'TL13' && dashboard.saving || id === 'TL14' && managementCalendar.saving, search: fields.pesquisa || '', monthOffset };
    const screen = design && (mobile ? design.steps[step] || design.mobile : design.desktop);
    const modalScreen = dialogDesign && (mobile ? dialogDesign.steps[dialogStep] || dialogDesign.mobile : dialogDesign.desktop);
    const info = screens.find(s => s.id === id);
    return <>
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    {preview && <aside className="preview-bar" aria-label="Prévia de desenvolvimento">
      <span>Protótipo • dados ilustrativos</span>
      <label><span className="sr-only">Tela</span><select aria-label="Tela do protótipo" value={id} onChange={e => go(e.target.value)}>{screens.map(s => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}</select></label>
      <button type="button" onClick={() => navigate('/')}>Sair da prévia</button>
    </aside>}
    <main id="main-content" className={`design-page ${mobile ? 'design-mobile' : 'design-desktop'}${['TL01', 'TL08', 'TL09'].includes(id) ? ' institutional-page' : ''}${id === 'TL07' ? ' diary-page' : ''}${id === 'TL06' ? ' pet-registration-page' : ''}${id === 'TL10' ? ' monitor-feed-page' : ''}${id === 'TL13' ? ' dashboard-page' : ''}${id === 'TL14' ? ' management-calendar-page' : ''}`} aria-label={info.name}>
      {id === 'TL07' && !preview && (petDiary.loading || petDiary.error) && <p className="loading-message" role={petDiary.error ? 'alert' : 'status'}>{petDiary.error || 'Carregando diário do pet…'}</p>}
      {id === 'TL10' && (preview || monitorFeed.loading || monitorFeed.error) && <p className="loading-message" role="status">{preview ? `${monitorDataUnavailable} Novos rascunhos podem ser salvos apenas em memória e ficam bloqueados para alterações nesta sessão; recarregar a página descarta esses dados.` : monitorFeed.error || 'Carregando rotina do pet…'}</p>}
       {id === 'TL11' && preview && <p className="loading-message" role="status">{presenceDataUnavailable} Horários, presença e contadores dos cartões são exemplos, não registros consultados do sistema.</p>}
       {id === 'TL11' && !preview && presence.error && <p className="loading-message" role="alert">{presence.error}</p>}
       {id === 'TL12' && !preview && dailyActivities.error && <p className="loading-message" role="alert">{dailyActivities.error} <button type="button" disabled={dailyActivities.saving || dailyActivities.loading} onClick={dailyActivities.retry}>Tentar novamente</button></p>}
      {id === 'TL06' && petHealthCatalog.message && <p className="loading-message" role="status">{petHealthCatalog.message}</p>}
      {id === 'TL13' && (dashboard.loading || dashboard.loadError) && <p className="loading-message" role={dashboard.loadError ? 'alert' : 'status'}>{dashboard.loadError || 'Carregando dados do dashboard…'}</p>}
      {!design && <p role="status" className="loading-message">{message || 'Carregando…'}</p>}
       {screen && <DesignContext.Provider value={{ ...context, presenceIntegrated: id === 'TL11' && !preview, dailyActivities: id === 'TL12' && !preview ? dailyActivities : undefined, busy: context.busy || presence.saving || dailyActivities.saving }}>
        <form ref={formRef} onSubmit={e => e.preventDefault()} aria-label={info.name}>
          <DesignRenderer node={enhance(id === 'TL10' && !preview ? integratedMonitorDesign(screen, monitorFeed) : id === 'TL07' && !preview ? integratedPetDiaryDesign(screen, petDiary, diaryDay) : screen)} root/>
        </form>
      </DesignContext.Provider>}
      {menu && <Menu current={id} profile={info.profile || 'public'} go={go} close={closeMenu}/>}
    </main>
    <input ref={fileRef} type="file" className="sr-only" tabIndex={-1} aria-label="Foto do pet" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
                if (id === 'TL06') {
                    const error = validatePetPhoto(file);
                    if (error) {
                        setMessage(error);
                        e.target.value = '';
                        return;
                    }
                    setPetPhoto(file);
                    setMessage('A foto será exibida apenas nesta prévia; o backend não possui endpoint para salvá-la.');
                }
                if (photoRef.current)
                    URL.revokeObjectURL(photoRef.current);
                photoRef.current = URL.createObjectURL(file);
                setPhoto(photoRef.current);
            }
        }}/>
    {(message || busy) && <div className="status-message" role={busy ? 'status' : 'alert'}>{busy ? 'Aguarde…' : message}<button type="button" aria-label="Fechar mensagem" onClick={() => setMessage('')}>×</button></div>}
    {id === 'TL14' && <ManagementCalendarDialogs calendar={managementCalendar}/>}
    {id === 'TL06' && <PetCatalogDialog catalog={petHealthCatalog}/>}
    {id === 'TL12' && !preview && dailyActivities.detailsPet && <Modal title={`Detalhes de ${dailyActivities.detailsPet.nome}`} onClose={dailyActivities.closePet}>
      <div className="dialog-content"><h2>{dailyActivities.detailsPet.nome}</h2>
        {dailyActivities.detailsError ? <p role="alert">{dailyActivities.detailsError}</p> : !dailyActivities.details ? <p role="status">Carregando detalhes…</p> : <>
          <p>Pet {dailyActivities.detailsPet.idPet} • {dailyActivities.details.raca || 'Raça não informada'}</p>
          <p>Tutor: {dailyActivities.details.nomeTutor || 'não informado'}</p>
          <p>Observações: {dailyActivities.details.observacao || 'não informadas'}</p>
        </>}
        <div className="dialog-actions"><button type="button" onClick={dailyActivities.closePet}>Voltar</button></div>
      </div>
    </Modal>}
    {id === 'TL11' && !preview && presence.target && <Modal title={presence.target.operation === 'checkIn' ? 'Registrar entrada' : 'Registrar saída'} onClose={presence.close}>
      <form className="dialog-content" onSubmit={event => { event.preventDefault(); void presence.save(); }}>
        <h2>{presence.target.operation === 'checkIn' ? 'Registrar entrada' : 'Registrar saída'} • {presence.target.pet.nomePet}</h2>
        <label className="allergy-description">Nome do responsável<input required maxLength={100} autoFocus value={presence.responsible} disabled={presence.saving} onChange={event => presence.setResponsible(event.target.value)}/></label>
        {presence.error && <p role="alert">{presence.error}</p>}
        <div className="dialog-actions"><button type="button" disabled={presence.saving} onClick={presence.close}>Cancelar</button><button type="submit" disabled={presence.saving || !presence.responsible.trim()}>{presence.saving ? 'Aguarde…' : 'Confirmar'}</button></div>
      </form>
    </Modal>}
    {dialog && <Modal title={dialog === 'assistant' ? 'Assistente EcoMigo' : dialog === 'confirm' ? 'Confirmar operação' : 'Formulário'} onClose={close} wide={dialog === 'petEdit'}>
      {dialog === 'linkPlan' && <p className="dialog-content" role="status">{recordIdentityUnavailable} O formulário permanece apenas como rascunho ilustrativo de vínculo.</p>}
      {modalScreen ? <DesignContext.Provider value={{ ...context, modal: true }}><form ref={modalFormRef} className={id === 'TL13' ? 'dashboard-form' : undefined} onSubmit={e => e.preventDefault()}><DesignRenderer node={enhance(modalScreen, id === 'TL13')} root/></form></DesignContext.Provider>
                : dialog === 'confirm' ? <div className="dialog-content"><h2>Confirmar operação</h2><p>Deseja confirmar esta ação?</p><div className="dialog-actions"><button type="button" onClick={close}>Cancelar</button><button type="button" disabled={busy} onClick={() => confirmAction && void run(confirmAction)}>Confirmar</button></div></div>
                    : dialog === 'allergies' ? <form ref={modalFormRef} className="dialog-content" onSubmit={e => {
                            e.preventDefault();
                            const description = allergyDescription.trim();
                            if (allergyDraft.includes('Outros') && !description)
                                return;
                            setAllergies([...new Set([...allergyDraft.filter(a => a !== 'Outros'), ...(allergyDraft.includes('Outros') ? [description] : [])])]);
                            close();
                        }}><h2>Alergias</h2><p>Selecione uma ou mais alergias previamente cadastradas. Quando “Outros” for selecionado, o campo de descrição personalizada será exibido.</p>{[...new Set(['Alergia a frango', ...allergies, 'Outros'])].map(a => <label key={a} className="allergy-option"><input type="checkbox" checked={allergyDraft.includes(a)} onChange={e => setAllergyDraft(v => e.target.checked ? [...v, a] : v.filter(x => x !== a))}/>{a}</label>)}{allergyDraft.includes('Outros') && <label className="allergy-description">Descrição da alergia *<input required value={allergyDescription} onChange={e => setAllergyDescription(e.target.value)}/></label>}<div className="dialog-actions"><button type="button" onClick={close}>Cancelar</button><button type="submit" disabled={allergyDraft.includes('Outros') && !allergyDescription.trim()}>Salvar alergia</button></div></form>
                        : dialog === 'details' && id === 'TL09' && !preview ? <ActivityCatalogDetails close={close}/>
                            : dialog === 'details' ? <div className="dialog-content"><h2>Detalhes</h2><p>Os detalhes desta atividade dependem dos dados do sistema.</p><button type="button" onClick={close}>Voltar</button></div>
                                : dialog === 'profile' ? <div className="dialog-content"><h2>Meus Dados</h2><p>Os dados da conta dependem da autenticação no sistema.</p><button type="button" onClick={close}>Voltar</button></div>
                                    : <p role="status" className="loading-message">Carregando…</p>}
    </Modal>}
  </>;
}
