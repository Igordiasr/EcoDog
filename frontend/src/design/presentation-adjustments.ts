import { content, nodes, type DesignNode } from './types';

export function diaryActionsDesign(node: DesignNode): DesignNode {
  const children = nodes(node), back = children.find(child => child.name === 'Botão' && content(child).trim() === 'Voltar');
  const booking = children.find(child => child.name === 'Novo agendamento');
  const button = booking && nodes(booking).find(child => child.name === 'Botão' && content(child).trim() === 'Agendar');
  if (!back || !booking || !button) return node;
  return { ...node, children: node.children?.map(child => child === back ? { tag: 'div', id: 'diary-actions', name: 'Ações do diário', className: 'diary-actions', children: [back, button] } : child === booking ? { ...booking, children: booking.children?.filter(child => child !== button) } : child) };
}
export function checkInFeedDesign(node: DesignNode): DesignNode {
  if (node.name !== 'Check de entrada e saída') return node;
  const template = nodes(node).find(child => child.name === 'Botão' && content(child).trim() === 'Atividades');
  if (!template) return node;
  const button = { ...template, id: `${node.id}-feed`, children: [{ tag: 'span', name: 'Ação', className: "font-['Lilita_One',system-ui,sans-serif]", children: ['Feed do Monitor'] }] };
  return { ...node, children: [...(node.children || []), button] };
}
