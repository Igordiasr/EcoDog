import { requestJson } from './http';
import { date, list, object, positiveId } from '../models/integration-contracts';
import { loadActiveServices, loadBookingAvailability } from './booking-availability';
export function createBookingApi(baseUrl, request) {
    return {
        services: (category, signal) => loadActiveServices(baseUrl, category, signal, request),
        availability: (category, year, month, signal) => loadBookingAvailability(baseUrl, category, year, month, signal, request),
        /** Personal queries: caller must supply identity authorized by backend (SEC-01). */
        async pets(userId, signal) {
            positiveId(userId, 'usuário');
            return list(await requestJson(baseUrl, '/calendario/pets', { query: { idUsuario: userId } }, signal, request), 'pets do tutor').map(item => { const p = object(item, 'pet'); positiveId(p.idPet, 'pet'); return p; });
        },
        async appointments(userId, year, month, signal) {
            positiveId(userId, 'usuário');
            if (!Number.isInteger(year) || year < 2000 || !Number.isInteger(month) || month < 1 || month > 12)
                throw new Error('Período inválido');
            return list(await requestJson(baseUrl, '/calendario/tutor/agendamentos', { query: { idUsuario: userId, ano: year, mes: month } }, signal, request), 'agendamentos').map(item => object(item, 'agendamento'));
        },
    };
}
/** Contract-only validator; actual booking writes remain gated by AGE-01/02 and SEC-01. */
export function validateBudgetDraft(draft) {
    positiveId(draft.idServico, 'serviço');
    if (!draft.idsPet.length || !draft.datasUtilizacao.length)
        throw new Error('Pets e datas são obrigatórios.');
    draft.idsPet.forEach(id => positiveId(id, 'pet'));
    draft.datasUtilizacao.forEach(d => date(d, 'data de utilização'));
    if (new Set(draft.idsPet).size !== draft.idsPet.length || new Set(draft.datasUtilizacao).size !== draft.datasUtilizacao.length)
        throw new Error('Pets e datas não podem se repetir.');
    return { idServico: draft.idServico, idsPet: [...draft.idsPet], datasUtilizacao: [...draft.datasUtilizacao] };
}
