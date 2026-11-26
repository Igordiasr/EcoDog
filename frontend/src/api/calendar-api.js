import { HttpError, requestJson } from './http';
import { validISODate, validPeriod } from '../models/dashboard-model';
import { uuid } from '../models/integration-contracts';
function record(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`Resposta inválida: ${label}.`);
    return value;
}
function array(value, label) {
    if (!Array.isArray(value))
        throw new Error(`Resposta inválida: ${label}.`);
    return value;
}
function id(value, label) {
    if (!Number.isSafeInteger(value) || value <= 0)
        throw new Error(`Identificador inválido: ${label}.`);
    return String(value);
}
function capacity(value, label) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new Error(`Capacidade inválida: ${label}.`);
    return value;
}
function optionalText(value, label) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value !== 'string')
        throw new Error(`Texto inválido: ${label}.`);
    return value;
}
function time(value) {
    if (value === null || value === undefined)
        return undefined;
    if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/.test(value))
        throw new Error('Horário inválido.');
    return value.slice(0, 5);
}
const statuses = ['PENDENTE', 'AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'];
function parseDay(payload, expected, data) {
    const day = record(payload, 'dia');
    if (day.data !== expected)
        throw new Error(`Data divergente para ${expected}.`);
    if (day.idCalendario !== null)
        id(day.idCalendario, 'calendário');
    const configured = day.idCalendario !== null;
    const creche = capacity(day.vagasCreche, 'Creche');
    const hotel = capacity(day.vagasHotel, 'Hotel');
    data.days.push({ date: expected, capacity: configured ? { Creche: creche, Hotel: hotel } : {} });
    array(day.atividades, 'atividades').forEach(raw => {
        const a = record(raw, 'atividade');
        const activityId = id(a.idAtividadeDoDia, 'atividade programada');
        id(a.idAtividade, 'catálogo');
        if (typeof a.nome !== 'string' || !a.nome.trim())
            throw new Error('Nome de atividade inválido.');
        data.activities.push({ id: activityId, date: expected, name: a.nome, start: time(a.horaInicio), end: time(a.horaFim) });
    });
    array(day.alunosAgendados, 'alunos').forEach(raw => {
        const a = record(raw, 'aluno');
        if (typeof a.nome !== 'string' || !a.nome.trim() || (a.situacao != null && !statuses.includes(String(a.situacao))))
            throw new Error('Aluno agendado inválido.');
        const age = a.idade === null ? undefined : capacity(a.idade, 'idade');
        const student = { id: id(a.idAgendamento, 'agendamento'), petId: uuid(a.idPet, 'pet'), date: expected, name: a.nome, breed: optionalText(a.raca, 'raça'), tutor: optionalText(a.tutor, 'tutor'), age, status: a.situacao };
        data.students.push(student);
    });
}
export function createCalendarSource(baseUrl, request, token, onSessionExpired) {
    const call = async (path, options = {}, signal) => {
        try {
            return await requestJson(baseUrl, path, { ...options, headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
        } catch (error) {
            if (error instanceof HttpError && error.status === 401) onSessionExpired?.();
            throw error;
        }
    };
    const get = (path, query, signal) => call(path, { query }, signal);
    return {
        activityConflict: () => true,
        async catalog(signal) {
            return array(await get('/calendario/catalogo-atividades', undefined, signal), 'atividades').map(item => ({ id: id(item.idAtividade, 'atividade'), name: optionalText(item.nome, 'nome') }));
        },
        async apply(command) {
            if (command.kind === 'capacity') {
                const current = await get('/calendario/dia', { data: command.date });
                const creche = capacity(current.vagasCreche, 'Creche');
                const hotel = capacity(current.vagasHotel, 'Hotel');
                return call(`/calendario/${command.date}/vagas`, { method: 'PUT', body: { vagasCreche: command.service === 'Creche' ? command.quantity : creche, vagasHotel: command.service === 'Hotel' ? command.quantity : hotel } });
            }
            if (command.kind === 'activity') return call(`/calendario/${command.activity.date}/atividades`, { method: 'POST', body: { idAtividade: Number(command.activity.catalogId), horaInicio: `${command.activity.start}:00`, horaFim: `${command.activity.end}:00` } });
            if (command.kind === 'removeActivity') return call(`/calendario/atividades/${command.id}`, { method: 'DELETE' });
            throw new Error('Esta alteração não está disponível.');
        },
        async loadMonth(period, selectedDate, signal) {
            if (!validPeriod(period))
                throw new Error('Mês inválido.');
            if (selectedDate && (!validISODate(selectedDate) || !selectedDate.startsWith(`${period}-`)))
                throw new Error('Data selecionada inválida.');
            const raw = array(await get('/calendario/dias', { mes: period }, signal), 'datas');
            const dates = raw.map(d => { if (typeof d !== 'string' || !validISODate(d) || !d.startsWith(`${period}-`))
                throw new Error('Data configurada inválida.'); return d; });
            if (new Set(dates).size !== dates.length)
                throw new Error('Datas configuradas duplicadas.');
            const allDates = [...new Set([...dates, ...(selectedDate ? [selectedDate] : [])])];
            const data = { days: [], activities: [], bookings: [], students: [] };
            // Bounded concurrency (4). A failed day rejects the entire month.
            let next = 0;
            const results = new Array(allDates.length);
            await Promise.all(Array.from({ length: Math.min(4, allDates.length) }, async () => {
                while (next < allDates.length) {
                    const index = next++;
                    results[index] = await get('/calendario/dia', { data: allDates[index] }, signal);
                }
            }));
            results.forEach((rawDay, index) => parseDay(rawDay, allDates[index], data));
            return data;
        },
    };
}
