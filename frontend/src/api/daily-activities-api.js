import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, positiveId, text } from '../models/integration-contracts';
export function createDailyActivitiesApi(baseUrl, request) {
    return {
        /** GET /atividades returns today's program; never append an undocumented date parameter. */
        async today(signal) {
            const raw = object(await requestJson(baseUrl, '/atividades', {}, signal, request), 'atividades do dia');
            return { data: date(raw.data, 'data'), atividadesDoDia: list(raw.atividadesDoDia, 'atividades').map(item => {
                    const a = object(item, 'atividade programada');
                    return { idAtividadeDoDia: positiveId(a.idAtividadeDoDia, 'atividade'), nome: text(a.nome, 'nome'), descricao: optionalText(a.descricao, 'descrição'), categoria: optionalText(a.categoria, 'categoria'), situacao: enumValue(a.situacao, ['PENDENTE', 'CONCLUIDA', 'NAO_CONCLUIDA'], 'atividade'), grupos: list(a.grupos, 'grupos').map(group => { const g = object(group, 'grupo'); return { grupo: g.grupo, petsDoGrupo: list(g.petsDoGrupo, 'pets').map(pet => { const p = object(pet, 'pet'); return { idPet: positiveId(p.idPet, 'pet'), nome: text(p.nome, 'nome'), idParticipacaoDoPet: positiveId(p.idParticipacaoDoPet, 'participação'), idAgendamento: positiveId(p.idAgendamento, 'agendamento') }; }) }; }) };
                }) };
        },
    };
}
