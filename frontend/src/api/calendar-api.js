import { requestJson } from './http';
import { validISODate, validPeriod } from '../models/dashboard-model';
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
    if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value))
        throw new Error('Horário inválido.');
    return value.slice(0, 5);
}
const statuses = ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'];
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
        if (typeof a.nome !== 'string' || !a.nome.trim() || !statuses.includes(String(a.situacao)))
            throw new Error('Aluno agendado inválido.');
        const age = a.idade === null ? undefined : capacity(a.idade, 'idade');
        const student = { id: id(a.idAgendamento, 'agendamento'), petId: id(a.idPet, 'pet'), date: expected, name: a.nome, breed: optionalText(a.raca, 'raça'), tutor: optionalText(a.tutor, 'tutor'), age, status: a.situacao };
        data.students.push(student);
    });
}
/** Read-only until SEC-01 validates administrator authorization and writes are concurrency-safe. */
export function createCalendarSource(baseUrl, request) {
    const get = (path, query, signal) => requestJson(baseUrl, path, { query }, signal, request);
    return {
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
