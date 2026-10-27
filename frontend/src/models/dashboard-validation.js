import { dashboardServices, parseMoney, validPeriod } from './dashboard-model';
import { petDateISO } from './pet-validation';
export function selectedGoal(data, values) {
    const goals = data?.goals.filter(goal => goal.period === values['mes-cadastrado'] && goal.service === values.servico) || [];
    return goals.length === 1 ? goals[0] : undefined;
}
export function validateDashboardForm(mode, values, data) {
    const errors = {};
    if (!dashboardServices.includes(values.servico))
        errors.servico = 'Selecione um serviço válido.';
    if (parseMoney(values.valor || '') === null)
        errors.valor = 'Informe um valor monetário válido e não negativo.';
    if (mode === 'editGoal' || mode === 'loadedGoal') {
        if (!validPeriod(values['mes-cadastrado'] || '') || !data?.goals.some(goal => goal.period === values['mes-cadastrado']))
            errors['mes-cadastrado'] = 'Selecione um período com metas cadastradas.';
        if (!selectedGoal(data, values))
            errors.servico = 'Selecione uma meta existente para o período.';
    }
    else if (mode === 'createGoal') {
        if (!/^\d{4}$/.test(values.ano || '') || values.ano === '0000')
            errors.ano = 'Informe um ano válido.';
        if (!/^(0[1-9]|1[0-2])$/.test(values.mes || ''))
            errors.mes = 'Selecione um mês válido.';
        if (data?.goals.some(goal => goal.period === `${values.ano}-${values.mes}` && goal.service === values.servico))
            errors.servico = 'Já existe uma meta para este serviço e período. Utilize Editar meta.';
    }
    else {
        if (!data?.clients.some(client => client.id === values.cliente))
            errors.cliente = 'Selecione um cliente válido.';
        if (!data?.pets.some(pet => pet.id === values.pet && pet.clientId === values.cliente))
            errors.pet = 'Selecione um pet vinculado ao cliente.';
        if (!petDateISO(values.data || ''))
            errors.data = 'Data inválida';
    }
    if (!data)
        errors.formulario = 'A integração com os dados do dashboard ainda não está disponível.';
    return errors;
}
