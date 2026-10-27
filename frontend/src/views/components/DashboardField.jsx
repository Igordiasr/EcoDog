import { useState } from 'react';
import { content, fieldKey, nodes } from '../design/types';
import { dashboardServices, moneyBRL, parseMoney, periodLabel, validPeriod } from '../../models/dashboard-model';
import { selectedGoal, validateDashboardForm } from '../../models/dashboard-validation';
import { maskPetDate } from '../../models/pet-validation';
import { ArrowIcon } from './ArrowIcon';
function control(node) {
    if (/^Entrada/.test(node.name || ''))
        return node;
    return nodes(node).map(control).find(Boolean);
}
export function isDashboardField(node) {
    return ['Campo', 'Serviço', 'Mês', 'Mês cadastrado', 'Ano', 'Valor', 'Cliente', 'Pet', 'Data'].includes(node.name || '') && ['Rótulo', 'Label'].includes(nodes(node)[0]?.name || '') && !!control(node);
}
export function DashboardField({ node, dashboard }) {
    const [touched, setTouched] = useState(false);
    const children = nodes(node), labelNode = children[0], label = content(labelNode), key = fieldKey(label);
    const input = control(node);
    if (!input)
        return null;
    const id = `${input.id}-dashboard-input`, editing = dashboard.mode === 'editGoal' || dashboard.mode === 'loadedGoal';
    const value = editing && key === 'ano' ? dashboard.values['mes-cadastrado']?.slice(0, 4) || '' : dashboard.values[key] || '';
    const options = key === 'mes-cadastrado' ? [...new Set(dashboard.data?.goals.map(goal => goal.period).filter(validPeriod) || [])].sort().map(period => ({ value: period, label: periodLabel(period) }))
        : key === 'mes' ? Array.from({ length: 12 }, (_, index) => { const value = String(index + 1).padStart(2, '0'); return { value, label: periodLabel(`2026-${value}`).split(' de ')[0] }; })
            : key === 'servico' ? (editing ? dashboardServices.filter(service => dashboard.data?.goals.some(goal => goal.period === dashboard.values['mes-cadastrado'] && goal.service === service)) : [...dashboardServices]).map(value => ({ value, label: value }))
                : key === 'cliente' ? dashboard.data?.clients.map(client => ({ value: client.id, label: client.name })) || []
                    : key === 'pet' ? dashboard.data?.pets.filter(pet => pet.clientId === dashboard.values.cliente).map(pet => ({ value: pet.id, label: pet.name })) || [] : null;
    const disabled = dashboard.saving || editing && key === 'ano' || options !== null && !options.length || key === 'valor' && editing && !selectedGoal(dashboard.data, dashboard.values);
    const error = dashboard.errors[key] || (touched ? validateDashboardForm(dashboard.mode, dashboard.values, dashboard.data)[key] : '');
    const props = { id, name: key, value, disabled, required: true, 'aria-label': label, 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, className: `${input.className} design-input`, onBlur: () => {
            setTouched(true);
            if (key === 'valor') {
                const cents = parseMoney(value);
                if (cents !== null)
                    dashboard.change(key, moneyBRL(cents));
            }
        } };
    return <div className={`${node.className} dashboard-finance-field`} data-design-id={node.id}>
    <label className={labelNode.className} htmlFor={id}>{label}</label>
    {options ? <span className="select-arrow-slot"><select {...props} onChange={e => { setTouched(true); dashboard.change(key, e.target.value); }}><option value="">Selecione</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ArrowIcon direction="down"/></span>
            : <input {...props} type="text" inputMode={key === 'valor' ? 'decimal' : 'numeric'} maxLength={key === 'data' ? 10 : key === 'ano' ? 4 : 32} placeholder={key === 'data' ? 'dd/mm/aaaa' : key === 'valor' ? 'R$ 0,00' : content(input)} onChange={e => {
                    setTouched(true);
                    const value = key === 'data' ? maskPetDate(e.target.value) : key === 'ano' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value;
                    e.target.value = value;
                    dashboard.change(key, value);
                }} onPaste={e => {
                    if (key !== 'data')
                        return;
                    e.preventDefault();
                    setTouched(true);
                    const input = e.currentTarget;
                    const next = maskPetDate(input.value.slice(0, input.selectionStart || 0) + e.clipboardData.getData('text') + input.value.slice(input.selectionEnd ?? input.value.length));
                    input.value = next;
                    dashboard.change(key, next);
                }}/>}
    {children.filter(child => ['Orientação', 'Descrição'].includes(child.name || '')).map(child => <p key={child.id} className={child.className}>{content(child)}</p>)}
    {error && <p id={`${id}-error`} className="dashboard-field-error" role="status">{error}</p>}
  </div>;
}
