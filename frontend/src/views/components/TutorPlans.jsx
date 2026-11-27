import { planWeekdays, planServices } from '../../api/tutor-plans-api';
import { useTutorPlans } from '../../viewmodels/use-tutor-plans';

export function planFromPrototype(template, plan, index) {
    const values = [
        `${planServices[plan.servico]} • ${plan.nomePet}`,
        String(plan.quantidadeDias),
        plan.diasDaSemana.map(day => planWeekdays[day].replace('-feira', '')).join(' / ') || 'Consulte a EcoDog',
        'Consulte a EcoDog',
    ];
    let column = 0;
    const map = node => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id}-plan-${index}` };
        if (node.name === 'Dado' || node.name === 'Descrição') {
            const current = column++;
            copy.children = [values[current]];
            if (current === 3 && plan.diasAgendados.length) {
                copy.className += ' tutor-plan-dates';
                copy.children = plan.diasAgendados.map((day, dateIndex) => {
                    const [, month, date] = day.split('-');
                    return { tag: 'span', id: `${copy.id}-date-${dateIndex}`, name: 'Data agendada', className: 'tutor-plan-date', children: [`${Number(date)}/${Number(month)}`] };
                });
            }
        }
        else copy.children = node.children?.map(map);
        return copy;
    };
    return map(template);
}

export function TutorPlans({ session, node, renderNode }) {
    const model = useTutorPlans(session);
    if (model.loading) return <p role="status">Carregando seus planos…</p>;
    if (model.error) return <div><p role="alert">Não foi possível consultar seus planos. Tente novamente ou consulte a EcoDog.</p><button type="button" className="management-button" onClick={model.reload}>Tentar novamente</button></div>;
    if (!model.plans.length) return <p role="status">Você ainda não possui planos ou agendamentos.</p>;
    const header = node.children?.find(child => child.name === 'Cabeçalho da tabela');
    const row = node.children?.find(child => child.name === 'Plano');
    if (header && row) return renderNode({ ...node, name: 'Planos integrados', children: [header, ...model.plans.map((plan, index) => planFromPrototype(row, plan, index))] });
    return <div className="tutor-plans-mobile">{model.plans.map((plan, index) => renderNode({ ...planFromPrototype(node, plan, index), name: 'Plano integrado' }))}</div>;
}
