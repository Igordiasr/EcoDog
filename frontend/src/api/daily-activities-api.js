import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, positiveId, text } from '../models/integration-contracts';
export function createDailyActivitiesApi(baseUrl, request, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return {
        async complete(idAtividadeDoDia, signal) {
            positiveId(idAtividadeDoDia, 'atividade');
            return requestJson(baseUrl, '/atividades', { method: 'PUT', headers, body: { situacao: 'CONCLUIDA', idAtividadeDoDia } }, signal, request);
        },
        /** GET /atividades returns today's program; never append an undocumented date parameter. */
        async today(signal) {
            const raw = object(await requestJson(baseUrl, '/atividades', { headers }, signal, request), 'atividades do dia');
            return { data: date(raw.data, 'data'), atividadesDoDia: list(raw.atividadesDoDia, 'atividades').map(item => {
                    const a = object(item, 'atividade programada');
                    return { idAtividadeDoDia: positiveId(a.idAtividadeDoDia, 'atividade'), nome: text(a.nome, 'nome'), descricao: optionalText(a.descricao, 'descrição'), categoria: optionalText(a.categoria, 'categoria'), horaInicio: optionalText(a.horaInicio, 'horário inicial'), horaFim: optionalText(a.horaFim, 'horário final'), situacao: enumValue(a.situacao, ['PENDENTE', 'CONCLUIDA', 'NAO_CONCLUIDA'], 'atividade'), grupos: list(a.grupos, 'grupos').map(group => { const g = object(group, 'grupo'); if (!Number.isSafeInteger(g.grupo) || g.grupo < 0) throw new Error('Grupo inválido.'); return { grupo: g.grupo, petsDoGrupo: list(g.petsDoGrupo, 'pets').map(pet => { const p = object(pet, 'pet'); return { idPet: positiveId(p.idPet, 'pet'), nome: text(p.nome, 'nome'), idParticipacaoDoPet: positiveId(p.idParticipacaoDoPet, 'participação'), idAgendamento: positiveId(p.idAgendamento, 'agendamento') }; }) }; }) };
                }) };
        },
    };
}
