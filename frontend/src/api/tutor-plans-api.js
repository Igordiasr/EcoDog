import { requestJson } from './http';
import { sessionFromToken } from '../models/auth';
import { object, list, uuid, text, enumValue, date } from '../models/integration-contracts';

export const planWeekdays = { SEGUNDA: 'Segunda-feira', TERCA: 'Terça-feira', QUARTA: 'Quarta-feira', QUINTA: 'Quinta-feira', SEXTA: 'Sexta-feira', SABADO: 'Sábado', DOMINGO: 'Domingo' };
export const planServices = { CRECHE: 'Creche', HOTEL: 'Hotel', DAYUSE: 'Day Use' };

export async function loadTutorPlans(baseUrl, session, signal, request) {
    const auth = sessionFromToken(session?.token);
    if (!auth || auth.profile !== 'tutor' || auth.id !== String(session?.id).toLowerCase()) throw new Error('Sua sessão expirou. Entre novamente para consultar seus planos.');
    const response = await requestJson(baseUrl, `/tutores/${encodeURIComponent(auth.id)}/agendamentos`, { headers: { Authorization: `Bearer ${auth.token}` } }, signal, request);
    return list(response ?? [], 'planos').map(item => {
        const plan = object(item, 'plano');
        if (!Number.isSafeInteger(plan.quantidadeDias) || plan.quantidadeDias < 0) throw new Error('Quantidade de dias do plano inválida.');
        return {
            idPet: uuid(plan.idPet, 'pet'), nomePet: text(plan.nomePet, 'nome do pet'),
            servico: enumValue(plan.servico, Object.keys(planServices), 'serviço'), quantidadeDias: plan.quantidadeDias,
            diasDaSemana: list(plan.diasDaSemana ?? [], 'dias da semana').map(day => enumValue(day, Object.keys(planWeekdays), 'dia da semana')),
            diasAgendados: list(plan.diasAgendados, 'datas agendadas').map(day => date(day, 'data agendada')).sort(),
        };
    });
}
