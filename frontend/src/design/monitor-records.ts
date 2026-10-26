import { content, nodes, fieldKey, type DesignNode } from './types';
import { findDesignNode } from './structure-booking';

export const monitorOptions: Record<string, string[]> = {
  refeicao: ['Se alimentou', 'Recusou'], participacao: ['Participou', 'Não participou'], medicacao: ['Tomou', 'Não tomou'],
};
export interface MonitorSavedRecord { values: Record<string, string>; local: boolean; author?: string }
export function isMonitorRecord(node: DesignNode) { return ['Registro de alimentação', 'Registro de rotina', 'Observações gerais'].includes(node.name || ''); }
// Design status locks only the example; it does not prove server persistence.
// Saved snapshots are session-local, never operational identifiers.
export function monitorRecordLocked(node: DesignNode, saved?: MonitorSavedRecord): boolean {
  return !!saved || /^Registro salvo/.test(content(findDesignNode(node, 'Status') || '').trim());
}
export function monitorRecordKey(node: DesignNode): string {
  const identity = findDesignNode(node, 'Identificação do registro');
  return fieldKey(identity ? content(nodes(identity)[0]) : node.name || '');
}
export function monitorOption(value: string): string {
  return ({ 'Comida servida': 'Se alimentou', 'Não servida': 'Recusou', 'Não Participou': 'Não participou' } as Record<string, string>)[value.trim()] || value.trim();
}
export function monitorRecordValues(node: DesignNode, fields: Record<string, string>): Record<string, string> {
  const key = monitorRecordKey(node);
  const values: Record<string, string> = {};
  const selection = findDesignNode(node, 'Seleção atual');
  if (selection) {
    const children = nodes(selection);
    const field = fieldKey(content(children[0]));
    values[field] = fields[`monitor.${key}.${field}`] ?? monitorOption(content(children[1]));
  }
  const observation = findDesignNode(node, 'Campo de observações');
  if (observation) {
    const text = content(findDesignNode(observation, 'Entrada') || '');
    values.observacoes = fields[`monitor.${key}.observacoes`] ?? (/Conte um pouco|Ocorrência, comportamento/.test(text) ? '' : text.replace('Comida servida', 'Se alimentou'));
  }
  return values;
}
export function monitorRecordDesign(node: DesignNode, fields: Record<string, string>, saved?: MonitorSavedRecord): DesignNode {
   const values = saved?.values || monitorRecordValues(node, fields);
   const changed = !monitorRecordLocked(node, saved) && Object.keys(fields).some(key => key.startsWith(`monitor.${monitorRecordKey(node)}.`));
  const option = values.refeicao || values.participacao || values.medicacao || '';
  const status = saved && !changed ? `${saved.local ? 'Salvo apenas na prévia (memória)' : 'Registro salvo'}${option ? ` • ${option}` : ''}${saved.author ? ` • ${saved.author}` : ''}` : changed ? 'Alterações ainda não salvas' : '';
  const visit = (current: DesignNode): DesignNode => {
    if (current.name === 'Status') return { ...current, children: [status || (content(current).includes('Registro salvo') ? `${content(current)} (exemplo de desenvolvimento)` : content(current))] };
    if (current.name === 'Atribuição salvo' && saved) return { ...current, children: [saved.local ? 'Exemplo de desenvolvimento • registro em memória' : saved.author ? `Salvo por ${saved.author}` : 'Registro salvo'] };
    return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
  };
   const updated = visit(node);
   if (saved && !findDesignNode(updated, 'Status')) updated.children = [...(updated.children || []), { tag: 'p', name: 'Status', className: 'w-full', children: [status] }];
  // Mobile places the Save button after observations; move it into the selection row.
  const button = nodes(updated).find(child => child.name === 'Botão' && content(child) === 'Salvar');
  if (button) updated.children = updated.children?.filter(child => child !== button).map(child => typeof child !== 'string' && child.name === 'Registro e ações' ? { ...child, children: [...(child.children || []), button] } : child);
  return updated;
}
