import { content, nodes, type DesignNode } from './types';
import type { ManagementCalendarController } from '../services/use-management-calendar';

export function managementCalendarDesign(node: DesignNode, calendar: ManagementCalendarController): DesignNode {
  if (node.name === 'Apresentação') return { ...node, children: [...(node.children || []), { tag: 'div', name: 'Management state', className: 'w-full' }] };
  if (node.name === 'Calendário de setembro') return { ...node, name: 'Management calendar', children: [] };
  if (node.name === 'Configuração de vagas') return { ...node, name: /creche/i.test(content(node)) ? 'Management capacity Creche' : 'Management capacity Hotel', children: [] };
  if (node.name === 'Aplicação mensal') return { ...node, name: 'Management bulk', children: [] };
  if (node.name === 'Dia selecionado') return { ...node, children: node.children?.map((child, index) => typeof child !== 'string' && index === 1 ? { ...child, children: [String(Number(calendar.selectedDate.slice(-2)))] } : child) };
  const description = content(node);
  if (!nodes(node).length && /^Vagas para /.test(description)) return { ...node, children: [`Vagas para ${calendar.selectedDate.split('-').reverse().join('/')}.`] };
  const children = nodes(node);
  if (node.name === 'Painel' && children.some(child => child.name === 'Data e configuração')) {
    return { ...node, children: node.children?.flatMap(child => typeof child !== 'string' && child.name === 'Descrição' ? [child, { tag: 'div', name: 'Management availability', className: 'w-full' }] : [child]) };
  }
  const activityTemplate = children.find(child => child.name === 'Atividade');
  const bookingTemplate = children.find(child => child.name === 'Auluno agendado');
  if (activityTemplate || bookingTemplate) {
    const activities = !!activityTemplate;
    const rows = activities ? calendar.data?.activities.filter(row => row.date === calendar.selectedDate) || [] : calendar.data?.bookings.filter(row => row.date === calendar.selectedDate && row.status !== 'cancelled') || [];
    const template = activityTemplate || bookingTemplate!;
    let inserted = false;
    const updated = node.children?.flatMap(child => {
      if (typeof child === 'string' || !['Atividade', 'Auluno agendado'].includes(child.name || '')) return [child];
      if (inserted) return [];
      inserted = true;
      const cards: DesignNode[] = rows.map(row => ({ ...template, id: row.id, name: activities ? 'Management activity' : 'Management booking' }));
      return [{ tag: 'div', name: 'Management list', className: 'management-list w-full', children: cards.length ? cards : [{ tag: 'p', name: 'Estado da lista', className: 'w-full', children: [calendar.loading ? 'Carregando…' : calendar.loadError ? 'Não foi possível carregar os registros.' : activities ? 'Nenhuma atividade cadastrada para esta data.' : 'Nenhum agendamento para esta data.'] }] }];
    });
    const visit = (current: DesignNode): DesignNode => {
      if (current.name === 'Descrição' && /\d+ (atividades|agendamentos)/.test(content(current))) return { ...current, children: [`${rows.length} ${activities ? 'atividades' : 'agendamentos'} • ${calendar.selectedDate.split('-').reverse().join('/')}`] };
      return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
    };
    return visit({ ...node, children: updated });
  }
  return node;
}
