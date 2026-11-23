import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, positiveId, text, uuid } from '../models/integration-contracts';
export function activityGroup(value) {
    if (value === null || value === undefined) return 0;
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('Grupo inválido.');
    return value;
}
export function createDailyActivitiesApi(baseUrl, request, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return {
        async complete(idAtividadeDoDia, listaPets, signal) {
            positiveId(idAtividadeDoDia, 'atividade');
            list(listaPets, 'participações').forEach(id => positiveId(id, 'participação'));
            return requestJson(baseUrl, '/atividades', { method: 'PUT', headers, body: { situacao: 'CONCLUIDA', idAtividadeDoDia, listaPets: [...new Set(listaPets)] } }, signal, request);
        },
        /** GET /atividades returns today's program; never append an undocumented date parameter. */
        async today(signal) {
            const raw = object(await requestJson(baseUrl, '/atividades', { headers }, signal, request), 'atividades do dia');
            return { data: date(raw.data, 'data'), atividadesDoDia: list(raw.atividadesDoDia, 'atividades').map(item => {
                    const a = object(item, 'atividade programada');
                    return { idAtividadeDoDia: positiveId(a.idAtividadeDoDia, 'atividade'), nome: text(a.nome, 'nome'), descricao: optionalText(a.descricao, 'descrição'), categoria: optionalText(a.categoria, 'categoria'), horaInicio: optionalText(a.horaInicio, 'horário inicial'), horaFim: optionalText(a.horaFim, 'horário final'), situacao: enumValue(a.situacao, ['PENDENTE', 'CONCLUIDA', 'NAO_CONCLUIDA'], 'atividade'), grupos: list(a.grupos, 'grupos').map(group => { const g = object(group, 'grupo'); return { grupo: activityGroup(g.grupo), petsDoGrupo: list(g.petsDoGrupo, 'pets').map(pet => { const p = object(pet, 'pet'); return { idPet: uuid(p.idPet, 'pet'), nome: text(p.nome, 'nome'), idParticipacaoDoPet: positiveId(p.idParticipacaoDoPet, 'participação'), idAgendamento: positiveId(p.idAgendamento, 'agendamento') }; }) }; }) };
                }) };
        },
        async pet(idPet, signal) {
            uuid(idPet, 'pet');
            return object(await requestJson(baseUrl, `/feed-monitor/pet/${idPet}`, { headers }, signal, request), 'detalhes do pet');
        },
    };
}
