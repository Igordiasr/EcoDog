import { requestJson } from './http';
import { list, object, optionalText, positiveId, text } from '../models/integration-contracts';
const activity = raw => {
    const a = object(raw, 'participação');
    return { idParticipacaoDoPet: positiveId(a.idParticipacaoDoPet, 'participação'), nomeAtividade: text(a.nomeAtividade, 'atividade'), categoriaAtividade: optionalText(a.categoriaAtividade, 'categoria'), situacao: text(a.situacao, 'estado'), observacao: optionalText(a.observacao, 'observação') };
};
const medication = raw => {
    const m = object(raw, 'medicação');
    return { idMedicacaoDoDia: positiveId(m.idMedicacaoDoDia, 'medicação do dia'), nomeMedicacao: text(m.nomeMedicacao, 'nome'), status: text(m.status, 'estado'), observacao: optionalText(m.observacao, 'observação') };
};
export function createMonitorFeedApi(baseUrl, request, token) {
    const get = (path, signal) => requestJson(baseUrl, path, { headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
    const write = (path, method, body, signal) => requestJson(baseUrl, path, { method, body, headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
    const update = (petId, id, kind, situacao, observacao = '', signal) => {
        positiveId(petId, 'pet');
        positiveId(id, 'registro');
        const allowed = kind === 'atividades' ? ['PARTICIPOU', 'NAO_PARTICIPOU'] : ['TOMOU', 'NAO_TOMOU'];
        if (!allowed.includes(situacao)) throw new Error('Selecione uma opção válida para este registro.');
        if (situacao.startsWith('NAO_') && !observacao.trim()) throw new Error('Informe uma justificativa para este registro.');
        return write(`/feed-monitor/pet/${petId}/${kind}/${id}`, 'PUT', { situacao, observacao: observacao.trim() }, signal).then(raw => {
            const result = kind === 'atividades' ? activity(raw) : medication(raw);
            if ((result.idParticipacaoDoPet || result.idMedicacaoDoDia) !== id) throw new Error('Resposta inválida: registro diferente do solicitado.');
            return result;
        });
    };
    return {
        updateActivity: (petId, id, situacao, observacao, signal) => update(petId, id, 'atividades', situacao, observacao, signal),
        updateMedication: (petId, id, situacao, observacao, signal) => update(petId, id, 'medicacoes', situacao, observacao, signal),
        observation(petId, observacao, signal) {
            positiveId(petId, 'pet');
            const value = observacao.trim();
            if (!value || value.length > 200) throw new Error('Informe uma observação de até 200 caracteres.');
            return write(`/feed-monitor/pet/${petId}/observacoes`, 'POST', { observacao: value }, signal).then(raw => ({ observacao: text(object(raw, 'observação salva').observacao, 'observação') }));
        },
        async pet(petId, signal) {
            positiveId(petId, 'pet');
            const p = object(await get(`/feed-monitor/pet/${petId}`, signal), 'pet no feed');
            return { petId, nome: text(p.nome, 'nome'), raca: optionalText(p.raca, 'raça'), nomeTutor: optionalText(p.nomeTutor, 'tutor'), observacao: optionalText(p.observacao, 'observação'), fotoUrl: optionalText(p.fotoUrl, 'foto') };
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
