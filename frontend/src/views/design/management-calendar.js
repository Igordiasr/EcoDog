import { content, nodes } from './types';
export function managementCalendarDesign(node, calendar) {
    if (node.name === 'Apresentação')
        return { ...node, children: [...(node.children || []), { tag: 'div', name: 'Management state', className: 'w-full' }] };
    if (node.name === 'Calendário e rotina do dia') {
        const children = nodes(node);
        const calendarColumn = children.find(child => child.name === 'Calendário e configuração');
        const activityColumn = children.find(child => child.name === 'Atividades do dia');
        const studentColumn = children.find(child => child.name === 'Aulunos agendados');
        if (calendarColumn && activityColumn && studentColumn && children.length === 3)
            return { ...node, children: [calendarColumn, { tag: 'div', name: 'Painéis de atividades e aulunos', className: 'management-calendar-columns-side', children: [activityColumn, studentColumn] }] };
    }
    if (node.name === 'Calendário de setembro')
        return { ...node, name: 'Management calendar', children: [] };
    if (node.name === 'Configuração de vagas')
        return { ...node, name: /creche/i.test(content(node)) ? 'Management capacity Creche' : 'Management capacity Hotel', children: [] };
    if (node.name === 'Aplicação mensal')
        return { ...node, name: 'Management bulk', children: [] };
    if (node.name === 'Dia selecionado')
        return { ...node, children: node.children?.map((child, index) => typeof child !== 'string' && index === 1 ? { ...child, children: [String(Number(calendar.selectedDate.slice(-2)))] } : child) };
    const description = content(node);
    if (!nodes(node).length && /^Vagas para /.test(description))
        return { ...node, children: [`Vagas para ${calendar.selectedDate.split('-').reverse().join('/')}.`] };
    const children = nodes(node);
    const activityTemplate = children.find(child => child.name === 'Atividade');
    const bookingTemplate = children.find(child => child.name === 'Auluno agendado');
    if (activityTemplate || bookingTemplate) {
        const activities = !!activityTemplate;
        const rows = activities ? calendar.data?.activities.filter(row => row.date === calendar.selectedDate) || [] : calendar.data?.bookings.filter(row => row.date === calendar.selectedDate && row.status !== 'cancelled') || [];
        const template = activityTemplate || bookingTemplate;
        let inserted = false;
        const updated = node.children?.flatMap(child => {
            if (typeof child === 'string' || !['Atividade', 'Auluno agendado'].includes(child.name || ''))
                return [child];
            if (inserted)
                return [];
            inserted = true;
            const students = activities ? [] : calendar.data?.students?.filter(row => row.date === calendar.selectedDate) || [];
            const listRows = activities || calendar.example ? rows : students;
            const cardName = activities ? 'Management activity' : calendar.example ? 'Management booking' : 'Management student';
            const makeCards = items => items.map(row => ({ ...template, id: row.id, name: cardName }));
            let list;
            if (activities || !calendar.data) {
                const cards = makeCards(listRows);
                list = cards.length ? cards : [{ tag: 'p', name: 'Estado da lista', className: 'w-full', children: [calendar.loading ? 'Carregando…' : calendar.loadError ? 'Não foi possível carregar os registros.' : activities ? 'Nenhuma atividade cadastrada para esta data.' : 'Nenhum agendamento para esta data.'] }];
            } else {
                const pending = listRows.filter(row => row.status === 'PENDENTE' || row.status === 'pending');
                const others = listRows.filter(row => row.status !== 'PENDENTE' && row.status !== 'pending');
                const group = (name, title, items, empty) => ({ tag: 'section', name, className: 'management-student-group', children: [
                    { tag: 'h3', name: 'Título do grupo', className: 'management-student-group-title', children: [`${title} (${items.length})`] },
                    ...(items.length ? makeCards(items) : [{ tag: 'p', name: 'Estado do grupo', className: 'management-student-group-empty', children: [empty] }]),
                ] });
                list = [group('Aulunos a confirmar', 'A confirmar', pending, 'Nenhum auluno aguardando confirmação.'), group('Demais aulunos', 'Demais aulunos', others, 'Nenhum outro auluno agendado para esta data.')];
            }
            return [{ tag: 'div', name: 'Management list', className: 'management-list w-full', children: list }];
        });
        const visit = (current) => {
            if (current.name === 'Descrição' && /\d+ (atividades|agendamentos)/.test(content(current)))
                return { ...current, children: [`${activities || calendar.example ? rows.length : (calendar.data?.students?.filter(row => row.date === calendar.selectedDate).length || 0)} ${activities ? 'atividades' : 'agendamentos'} • ${calendar.selectedDate.split('-').reverse().join('/')}`] };
            return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
        };
        return visit({ ...node, children: updated });
    }
    return node;
}
