import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, text, uuid } from '../models/integration-contracts';
function parseDiary(raw, id, requestedDate) {
    const d = object(raw, 'diário');
    if (uuid(d.idPet, 'pet').toLowerCase() !== id.toLowerCase() || date(d.data, 'diário') !== requestedDate)
        throw new Error('Diário de pet/data diferente do solicitado.');
    const r = object(d.resumo, 'resumo');
    return { idPet: id, data: requestedDate, resumo: { statusRefeicao: optionalText(r.statusRefeicao, 'refeição'), statusEngajamento: optionalText(r.statusEngajamento, 'engajamento') }, atividades: list(d.atividades, 'atividades').map(a => ({ descricao: text(object(a, 'atividade').descricao, 'descrição') })), medicacoes: list(d.medicacoes, 'medicações').map(m => { const x = object(m, 'medicação'); return { nome: text(x.nome, 'nome'), status: enumValue(x.status, ['PENDENTE', 'TOMOU', 'NAO_TOMOU'], 'medicação') }; }), observacoes: optionalText(d.observacoes, 'observações') };
}
export function createPetDiaryApi(baseUrl, request, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return {
        /** Consulta somente leitura do resumo calculado pelo backend. */
        async day(petId, day, signal) {
            uuid(petId, 'pet');
            date(day, 'dia');
            return parseDiary(await requestJson(baseUrl, '/diario', { headers, query: { idPet: petId, data: day } }, signal, request), petId, day);
        },
        async historyDay(petId, day, signal) {
            return this.day(petId, day, signal);
        },
    };
}
