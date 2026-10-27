import { requestJson } from './http';
import { date, enumValue, list, object, optionalText, positiveId, text } from '../models/integration-contracts';
export function createPresenceApi(baseUrl, request) {
    return {
        /** Read only until MON-01 / SEC-01. Raw timestamps do not imply a performed check-in. */
        async list(day, signal) {
            date(day, 'dia');
            const raw = await requestJson(baseUrl, '/checkin-checkout', { query: { data: day } }, signal, request);
            return list(raw, 'presenças').map(item => {
                const p = object(item, 'presença');
                return { idAgendamento: positiveId(p.idAgendamento, 'agendamento'), idPet: positiveId(p.idPet, 'pet'), nomePet: text(p.nomePet, 'pet'), situacao: enumValue(p.situacao, ['AGENDADO', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'], 'presença'), dataEntradaRaw: optionalText(p.dataEntrada, 'entrada'), dataSaidaRaw: optionalText(p.dataSaida, 'saída'), tutorCheckin: optionalText(p.tutorCheckin, 'responsável na entrada'), tutorCheckout: optionalText(p.tutorCheckout, 'responsável na saída'), pertences: optionalText(p.pertences, 'pertences'), racaoMarca: optionalText(p.racaoMarca, 'ração'), quantidade: p.quantidade };
            });
        },
    };
}
