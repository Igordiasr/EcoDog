import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, positiveId, text } from '../models/integration-contracts';
export function createPresenceApi(baseUrl, request, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const register = (id, operation, responsible, signal) => {
        positiveId(id, 'agendamento');
        const responsavel = typeof responsible === 'string' ? responsible.trim() : '';
        if (!responsavel || responsavel.length > 100) throw new Error('Informe o nome do responsável (até 100 caracteres).');
        return requestJson(baseUrl, `/checkin-checkout/${id}/${operation}`, { method: 'PATCH', headers, body: { responsavel } }, signal, request);
    };
    return {
        checkIn: (id, responsible, signal) => register(id, 'check-in', responsible, signal),
        checkOut: (id, responsible, signal) => register(id, 'check-out', responsible, signal),
        async list(day, signal) {
            date(day, 'dia');
            const raw = await requestJson(baseUrl, '/checkin-checkout', { headers, query: { data: day } }, signal, request);
            return list(raw, 'presenças').map(item => {
                const p = object(item, 'presença');
                return { idAgendamento: positiveId(p.idAgendamento, 'agendamento'), idPet: positiveId(p.idPet, 'pet'), nomePet: text(p.nomePet, 'pet'), situacao: enumValue(p.situacao, ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'], 'presença'), dataEntradaRaw: optionalText(p.dataEntrada, 'entrada'), dataSaidaRaw: optionalText(p.dataSaida, 'saída'), tutorCheckin: optionalText(p.tutorCheckin, 'responsável na entrada'), tutorCheckout: optionalText(p.tutorCheckout, 'responsável na saída'), pertences: optionalText(p.pertences, 'pertences'), racaoMarca: optionalText(p.racaoMarca, 'ração'), quantidade: p.quantidade };
            });
        },
    };
}
