import { HttpError, requestJson } from './http';
import { sessionFromToken } from '../models/auth';

export function tutorBookingIdentity(session) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.profile !== 'tutor' || auth.id !== String(session.id)) throw new Error('Entre novamente para consultar seu agendamento.');
    return auth;
}
export async function bookingPets(baseUrl, session, signal, request) {
    const auth = tutorBookingIdentity(session);
    const data = await requestJson(baseUrl, '/calendario/pets', { query: { idUsuario: auth.id }, headers: { Authorization: `Bearer ${auth.token}` } }, signal, request);
    if (!Array.isArray(data) || data.some(pet => !Number.isSafeInteger(pet.idPet) || pet.idPet <= 0 || typeof pet.nomePet !== 'string')) throw new Error('Lista de pets inválida.');
    return data.map(pet => ({ idPet: pet.idPet, nome: pet.nomePet }));
}
export function availableBookingDates(rows, petCount, today = new Date()) {
    const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(today);
    const part = type => currentDate.find(part => part.type === type).value;
    const minimumDate = `${part('year')}-${part('month')}-${part('day')}`;
    return new Set(rows.filter(row => row.data >= minimumDate && row.vagasDisponiveis > 0 && row.vagasDisponiveis >= Math.max(1, petCount)).map(row => row.data));
}
export function matchingBookingService(services, category, frequency) {
    const matches = services.filter(item => item.categoria === category && (category !== 'CRECHE' || item.modalidade === 'PLANO' && Number(/\d+/.exec(item.frequencia)?.[0]) === frequency));
    return matches.length === 1 ? matches[0] : null;
}
export async function bookingBudget(baseUrl, session, service, idsPet, dates, signal, request) {
    const auth = tutorBookingIdentity(session);
    const body = { idServico: service.id, idsPet, datasUtilizacao: dates, ...(service.modalidade === 'PLANO' ? { dataInicioPlano: dates[0] } : {}) };
    const result = await requestJson(baseUrl, '/calendario/orcamentos', { method: 'POST', query: { idUsuario: auth.id }, headers: { Authorization: `Bearer ${auth.token}` }, body }, signal, request);
    if (!result || !Number.isFinite(result.valorTotal) || result.valorTotal < 0 || !Array.isArray(result.datasUtilizacao) || result.datasUtilizacao.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date))) throw new Error('Orçamento inválido retornado pelo sistema.');
    return result;
}
export async function saveTutorBooking(baseUrl, session, service, idsPet, dates, request) {
    const auth = tutorBookingIdentity(session);
    if (!Number.isSafeInteger(service?.id) || service.id <= 0 || !idsPet.length || idsPet.some(id => !Number.isSafeInteger(id) || id <= 0) || !dates.length || dates.some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date)) || new Set(idsPet).size !== idsPet.length || new Set(dates).size !== dates.length) throw new Error('Selecione o serviço, os pets e as datas antes de agendar.');
    const body = { idServico: service.id, idsPet, datasUtilizacao: dates, ...(service.modalidade === 'PLANO' ? { dataInicioPlano: dates[0] } : {}) };
    try {
        const result = await requestJson(baseUrl, '/calendario/agendamentos', { method: 'POST', query: { idUsuario: auth.id }, headers: { Authorization: `Bearer ${auth.token}` }, body }, undefined, request);
        if (!result || !Number.isFinite(result.valorTotal) || result.valorTotal < 0 || typeof result.aguardandoAprovacao !== 'boolean') throw new Error('Resposta inesperada. Confira seus agendamentos antes de tentar novamente.');
        return { ...result, message: result.aguardandoAprovacao ? 'Agendamento enviado e aguardando aprovação.' : 'Agendamento realizado com sucesso.' };
    } catch (error) {
        if (!(error instanceof HttpError)) throw error;
        const messages = { 400: 'Confira os pets e as datas selecionadas.', 401: 'Sua sessão expirou. Entre novamente.', 403: 'Um dos pets selecionados não pertence ao tutor.', 404: 'O serviço selecionado não está mais disponível.', 409: 'Não foi possível agendar: as vagas, os agendamentos ou o plano mudaram. Consulte novamente.' };
        throw new HttpError(error.status, messages[error.status] || error.message, error.fields);
    }
}
