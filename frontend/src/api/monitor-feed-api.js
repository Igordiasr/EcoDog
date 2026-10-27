import { requestJson } from './http';
import { list, object, optionalText, positiveId, text } from '../models/integration-contracts';
export function createMonitorFeedApi(baseUrl, request, token) {
    const get = (path, signal) => requestJson(baseUrl, path, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
    return {
        /** Read-only while MON-02/03 and RF-042 remain unverified. */
        async pet(petId, signal) {
            positiveId(petId, 'pet');
            const p = object(await get(`/feed-monitor/pet/${petId}`, signal), 'pet no feed');
            return { petId, nome: text(p.nome, 'nome'), raca: optionalText(p.raca, 'raça'), nomeTutor: optionalText(p.nomeTutor, 'tutor'), observacao: optionalText(p.observacao, 'observação') };
        },
        async activities(petId, signal) {
            positiveId(petId, 'pet');
            return list(await get(`/feed-monitor/pet/${petId}/atividades`, signal), 'atividades').map(raw => { const a = object(raw, 'participação'); return { idParticipacaoDoPet: positiveId(a.idParticipacaoDoPet, 'participação'), nomeAtividade: text(a.nomeAtividade, 'atividade'), categoriaAtividade: optionalText(a.categoriaAtividade, 'categoria'), situacao: text(a.situacao, 'estado'), observacao: optionalText(a.observacao, 'observação') }; });
        },
        async medication(petId, signal) {
            positiveId(petId, 'pet');
            return list(await get(`/feed-monitor/pet/${petId}/medicacoes`, signal), 'medicações').map(raw => { const m = object(raw, 'medicação'); return { idMedicacaoDoDia: positiveId(m.idMedicacaoDoDia, 'medicação do dia'), nomeMedicacao: text(m.nomeMedicacao, 'nome'), status: text(m.status, 'estado'), observacao: optionalText(m.observacao, 'observação') }; });
        },
    };
}
