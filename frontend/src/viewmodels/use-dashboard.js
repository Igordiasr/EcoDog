import { useCallback, useEffect, useRef, useState } from 'react';
import { dashboardServices, dateKey, moneyBRL, parseMoney } from '../models/dashboard-model';
import { selectedGoal, validateDashboardForm } from '../models/dashboard-validation';
import { petDateISO } from '../models/pet-validation';
export function useDashboard(enabled, preview, api, source) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [mode, setMode] = useState('createGoal');
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const inFlight = useRef(false);
    const sequence = useRef(0);
    const example = import.meta.env.DEV && preview && !source;
    useEffect(() => {
        if (!enabled)
            return;
        let active = true;
        setLoading(true);
        setData(null);
        setLoadError('');
        const load = source ? source.load() : example ? import('../models/dashboard-examples').then(module => module.dashboardExamples()) : Promise.reject(new Error('A integração com os dados do dashboard ainda não está disponível.'));
        load.then(result => { if (active)
            setData(result); }).catch(error => { if (active)
            setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.'); }).finally(() => { if (active)
            setLoading(false); });
        return () => { active = false; };
    }, [enabled, source, example]);
    const begin = (formMode) => { setMode(formMode); setValues({}); setErrors({}); };
    const change = (key, value) => {
        setValues(current => {
            const next = { ...current, [key]: value };
            if (key === 'cliente' && !data?.pets.some(pet => pet.id === next.pet && pet.clientId === value))
                next.pet = '';
            if ((mode === 'editGoal' || mode === 'loadedGoal') && (key === 'mes-cadastrado' || key === 'servico')) {
                if (key === 'mes-cadastrado' && !data?.goals.some(goal => goal.period === value && goal.service === next.servico))
                    next.servico = '';
                const goal = selectedGoal(data, next);
                next.valor = goal ? moneyBRL(goal.cents) : '';
            }
            const validated = validateDashboardForm(mode, next, data);
            setErrors(currentErrors => Object.fromEntries(Object.keys(currentErrors).filter(key => validated[key]).map(key => [key, validated[key]])));
            return next;
        });
    };
    const validate = (keys) => {
        const all = validateDashboardForm(mode, values, data);
        const relevant = keys ? Object.fromEntries(Object.entries(all).filter(([key]) => keys.includes(key) || key === 'formulario')) : all;
        setErrors(relevant);
        return relevant;
    };
    const save = useCallback(async () => {
        if (inFlight.current)
            return { success: false, message: '', errors: {} };
        const errors = validateDashboardForm(mode, values, data);
        setErrors(errors);
        if (Object.keys(errors).length || !data)
            return { success: false, message: 'Confira os campos indicados.', errors };
        inFlight.current = true;
        setSaving(true);
        try {
            const editing = mode === 'editGoal' || mode === 'loadedGoal';
            const goal = selectedGoal(data, values);
            const period = editing ? values['mes-cadastrado'] : `${values.ano}-${values.mes}`;
            const cents = parseMoney(values.valor);
            const service = values.servico;
            let message;
            if (example) {
                const next = { ...data };
                if (mode === 'revenue')
                    next.revenues = [...data.revenues, { id: `local-preview-revenue-${sequence.current++}`, clientId: values.cliente, petId: values.pet, service, date: petDateISO(values.data), cents }];
                else if (editing)
                    next.goals = data.goals.map(row => row.id === goal.id ? { ...row, cents } : row);
                else
                    next.goals = [...data.goals, { id: `local-preview-goal-${sequence.current++}`, period, service, cents }];
                setData(next);
                message = 'Atualizado somente na prévia (memória). Não foi salvo no servidor.';
            }
            else {
                // Uses existing execute operations only. This is NOT a new HTTP contract.
                const result = await api.execute(mode === 'revenue' ? 'saveRevenue' : 'saveGoal', mode === 'revenue'
                    ? { cliente: values.cliente, pet: values.pet, servico: service, data: petDateISO(values.data), valor: cents / 100 }
                    : { target: editing ? goal.id : undefined, servico: service, mes: Number(period.slice(5)), ano: Number(period.slice(0, 4)), valor: cents / 100 });
                message = result.message;
                if (source) {
                    try {
                        setData(await source.load());
                    }
                    catch {
                        message += ' Não foi possível atualizar os indicadores; recarregue os dados.';
                    }
                }
            }
            return { success: true, message, errors: {} };
        }
        catch (error) {
            return { success: false, message: error instanceof Error ? error.message : 'Não foi possível salvar. Os campos foram preservados.', errors: {} };
        }
        finally {
            inFlight.current = false;
            setSaving(false);
        }
    }, [mode, values, data, example, api, source]);
    return { data, loading, loadError, example, mode, values, errors, saving, begin, change, validate, save, today: dateKey(new Date()), services: dashboardServices };
}
