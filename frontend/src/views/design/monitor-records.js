import { content, nodes, fieldKey } from './types';
import { findDesignNode } from './structure-booking';
export const monitorOptions = {
    refeicao: ['Se alimentou', 'Recusou'], participacao: ['Participou', 'Não participou'], medicacao: ['Tomou', 'Não tomou'],
};
export function isMonitorRecord(node) { return ['Registro de alimentação', 'Registro de rotina', 'Observações gerais'].includes(node.name || ''); }
// Design status locks only the example; it does not prove server persistence.
// Saved snapshots are session-local, never operational identifiers.
export function monitorRecordLocked(node, saved) {
    if (node.monitorRecord?.unavailable) return true;
    return !!saved || /^Registro salvo/.test(content(findDesignNode(node, 'Status') || '').trim());
}
export function monitorRecordKey(node) {
    if (node.monitorRecord) return `${node.monitorRecord.kind}-${node.monitorRecord.id || 'day'}`;
    const identity = findDesignNode(node, 'Identificação do registro');
    return fieldKey(identity ? content(nodes(identity)[0]) : node.name || '');
}
// Populate the existing prototype templates without changing their layout or styles.
export function integratedMonitorDesign(root, feed) {
    const data = feed.data;
    const meal = a => /REFEICAO|ALIMENTACAO|RACAO/.test((a.categoriaAtividade || '').toUpperCase());
    const cloneRecord = (template, record, kind) => {
        const id = kind === 'medication' ? record.idMedicacaoDoDia : record.idParticipacaoDoPet;
        const state = record.status || record.situacao;
        const option = kind === 'medication' ? { TOMOU: 'Tomou', NAO_TOMOU: 'Não tomou' }[state] : kind === 'meal' ? { PARTICIPOU: 'Se alimentou', NAO_PARTICIPOU: 'Recusou' }[state] : { PARTICIPOU: 'Participou', NAO_PARTICIPOU: 'Não participou' }[state];
        const name = record.nomeMedicacao || record.nomeAtividade;
        const identity = findDesignNode(template, 'Identificação do registro');
        const titleId = nodes(identity)[0]?.id;
        const visit = node => ({ ...node, id: `${node.id}-${kind}-${id}`, children: node.id === titleId ? [name] : node.name === 'Descrição' ? [record.categoriaAtividade || ''] : node.name === 'Status' ? [state === 'PENDENTE' ? 'Escolha ainda não salva' : `Registro salvo • ${option || state}`] : node.name === 'Escolha atual' ? [option || 'Selecione'] : node.name === 'Entrada' ? [record.observacao || 'Conte um pouco mais...'] : node.name === 'Label' && content(node).startsWith('Observações') ? [`Observações • ${name}`] : node.children?.filter(c => typeof c === 'string' || c.name !== 'Atribuição salvo').map(c => typeof c === 'string' ? c : visit(c)) });
        return { ...visit(template), monitorRecord: { kind, id, name } };
    };
    const visit = node => {
        if (typeof node === 'string') return node;
        if (['Alimentação', 'Atividades', 'Medicações'].includes(node.name)) {
            const template = nodes(node).find(isMonitorRecord);
            const kind = node.name === 'Medicações' ? 'medication' : node.name === 'Alimentação' ? 'meal' : 'activity';
            const records = !data ? [] : kind === 'medication' ? data.medication : data.activities.filter(a => meal(a) === (kind === 'meal'));
            const templates = nodes(node).filter(isMonitorRecord);
            const unavailable = templates.map((t, index) => {
                const placeholder = cloneRecord(template, kind === 'medication' ? { idMedicacaoDoDia: `unavailable-${index}`, nomeMedicacao: 'Medicação não vinculada', status: 'PENDENTE' } : { idParticipacaoDoPet: `unavailable-${index}`, nomeAtividade: kind === 'meal' ? content(nodes(findDesignNode(t, 'Identificação do registro'))[0]) : 'Atividade não vinculada', situacao: 'PENDENTE' }, kind);
                const clear = n => ({ ...n, children: n.name === 'Status' ? [feed.loading ? 'Carregando registros do pet…' : 'Sem vínculo no agendamento de hoje'] : n.children?.map(c => typeof c === 'string' ? c : clear(c)) });
                return { ...clear(placeholder), monitorRecord: { ...placeholder.monitorRecord, unavailable: true } };
            });
            // Keep input controls visible even when the backend has no scheduled records.
            return { ...node, children: [...(node.children || []).filter(c => typeof c === 'string' || !isMonitorRecord(c)), ...(records.length && template ? records.map(r => cloneRecord(template, r, kind)) : unavailable)] };
        }
        if (node.name === 'Observações gerais') return { ...node, monitorRecord: { kind: 'observation' }, children: node.children?.map(visit) };
        if (!nodes(node).length && content(node).includes('Mariana Souza')) return { ...node, children: [content(node).startsWith('Responsável:') ? 'Responsável: monitor autenticado' : 'Preencha os cuidados e as observações do pet durante o dia.'] };
        if (!nodes(node).length && /Medicação 1 e Medicação 2/.test(content(node))) return { ...node, children: [data?.medication.map(m => m.nomeMedicacao).join(', ') || 'Nenhuma medicação vinculada para hoje.'] };
        const replacements = { Nome: data?.pet.nome || 'Pet', Raça: data?.pet.raca || '', Tutora: data ? `Tutor(a): ${data.pet.nomeTutor || ''}` : '', Orientação: data?.pet.observacao || '', Medicações: data?.medication.map(m => m.nomeMedicacao).join(', ') || 'Nenhuma medicação disponível.', Data: `Hoje • ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` };
        if (Object.hasOwn(replacements, node.name) && !nodes(node).length) return { ...node, children: [replacements[node.name]] };
        if (node.name === 'Descrição' && content(node).includes('auventuras')) return { ...node, children: [`Acompanhe as auventuras de ${data?.pet.nome || 'seu pet'} e registre cada cuidado do dia.`] };
        return { ...node, children: node.children?.map(visit) };
    };
    return visit(root);
}
export function monitorOption(value) {
    return { 'Comida servida': 'Se alimentou', 'Não servida': 'Recusou', 'Não Participou': 'Não participou' }[value.trim()] || value.trim();
}
export function monitorRecordValues(node, fields) {
    const key = monitorRecordKey(node);
    const values = {};
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
export function monitorRecordDesign(node, fields, saved) {
    const values = saved?.values || monitorRecordValues(node, fields);
    const changed = !monitorRecordLocked(node, saved) && Object.keys(fields).some(key => key.startsWith(`monitor.${monitorRecordKey(node)}.`));
    const option = values.refeicao || values.participacao || values.medicacao || '';
    const status = saved && !changed ? `${saved.local ? 'Salvo apenas na prévia (memória)' : 'Registro salvo'}${option ? ` • ${option}` : ''}${saved.author ? ` • ${saved.author}` : ''}` : changed ? 'Alterações ainda não salvas' : '';
    const visit = (current) => {
        if (current.name === 'Status')
                return { ...current, children: [status || (!node.monitorRecord && content(current).includes('Registro salvo') ? `${content(current)} (exemplo de desenvolvimento)` : content(current))] };
        if (current.name === 'Atribuição salvo' && saved)
            return { ...current, children: [saved.local ? 'Exemplo de desenvolvimento • registro em memória' : saved.author ? `Salvo por ${saved.author}` : 'Registro salvo'] };
        return { ...current, children: current.children?.map(child => typeof child === 'string' ? child : visit(child)) };
    };
    const updated = visit(node);
    if (saved && !findDesignNode(updated, 'Status'))
        updated.children = [...(updated.children || []), { tag: 'p', name: 'Status', className: 'w-full', children: [status] }];
    // Mobile places the Save button after observations; move it into the selection row.
    const button = nodes(updated).find(child => child.name === 'Botão' && content(child) === 'Salvar');
    if (button)
        updated.children = updated.children?.filter(child => child !== button).map(child => typeof child !== 'string' && child.name === 'Registro e ações' ? { ...child, children: [...(child.children || []), button] } : child);
    return updated;
}
