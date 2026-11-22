import { content, nodes } from './types';
import { findDesignNode } from './structure-booking';

export function integratedPetDiaryDesign(root, model, day) {
    const { data, pet } = model;
    const text = (template, value, id) => ({ ...template, id: `${template.id}-${id}`, children: [value] });
    const empty = value => ({ tag: 'p', className: 'w-full whitespace-pre-line', children: [value] });
    const unavailable = model.loading ? 'Carregando registros…' : model.error ? 'Registros indisponíveis.' : '';
    const clone = (node, suffix) => typeof node === 'string' ? node : { ...node, id: `${node.id}-${suffix}`, children: node.children?.map(child => clone(child, suffix)) };
    const visit = node => {
        if (typeof node === 'string') return node;
        if (node.name === 'Apresentação') return { ...node, children: node.children?.map(c => typeof c !== 'string' && c.name === 'Título' ? text(c, `Diário de ${pet?.nome || 'seu pet'}`, 'pet') : c) };
        if (node.name === 'Pet') return text(node, pet ? `${pet.nome} • ${pet.raca || ''}` : 'Selecione um pet', 'pet');
        if (node.name === 'Seletor de data') return { ...node, children: node.children?.map(c => { if (typeof c === 'string') return c; return { ...c, children: c.children?.map(x => typeof x !== 'string' && x.name === 'Ação' && /\d/.test(content(x)) ? text(x, day.split('-').reverse().join('/'), 'date') : x) }; }) };
        if (node.name === 'Painel') {
            const title = nodes(node).find(c => c.name === 'Título');
            const kind = content(title || '');
            if (kind === 'Refeição') {
                const record = findDesignNode(node, 'Registro de refeição');
                return { ...node, children: [title, { ...record, children: nodes(record).map(child => child.name === 'Descrição' ? text(child, unavailable || data?.resumo.statusRefeicao || 'Sem refeições registradas.', 'meal') : child) }] };
            }
            if (kind === 'Atividades') {
                const group = findDesignNode(node, 'Atividades do dia');
                const template = group && nodes(group)[0];
                const entries = (data?.atividades || []).map((a, index) => {
                    const card = clone(template, index);
                    return { ...card, children: nodes(card).filter(child => !['Status', 'Observações da atividade'].includes(child.name)).map(child => child.name === 'Título' ? text(child, `Atividade ${index + 1}`, 'title') : child.name === 'Descrição' ? text(child, a.descricao, 'description') : child) };
                });
                return { ...node, children: [title, text(findDesignNode(node, 'Descrição'), unavailable || data?.resumo.statusEngajamento || 'Sem participação registrada.', 'summary'), ...(group ? [{ ...group, children: entries.length ? entries : [empty(unavailable || 'Sem atividades registradas.')] }] : [])] };
            }
            if (kind === 'Medicações') {
                const group = findDesignNode(node, 'Registros de medicação');
                const template = group && nodes(group)[0];
                const entries = (data?.medicacoes || []).map((m, index) => {
                    const statusLabel = { TOMOU: 'Tomou', NAO_TOMOU: 'Não tomou', PENDENTE: 'Pendente' }[m.status];
                    const statusTemplate = nodes(group).find(card => content(findDesignNode(card, 'Status') || '') === statusLabel) || template;
                    const card = clone(statusTemplate, index);
                    return { ...card, children: nodes(card).filter(child => child.name !== 'Observações da medicação').map(child => child.name === 'Nome' ? text(child, m.nome, 'name') : child.name === 'Status' ? { ...child, children: nodes(child).filter(x => x.name === 'Rótulo' || m.status !== 'PENDENTE').map(x => x.name === 'Rótulo' ? text(x, statusLabel, 'status') : x) } : child) };
                });
                return { ...node, children: [title, ...(group ? [{ ...group, children: entries.length ? entries : [empty(unavailable || 'Sem medicações registradas.')] }] : [])] };
            }
            if (kind === 'Observações') return { ...node, children: [title, empty(unavailable || data?.observacoes || 'Sem observações registradas.')] };
        }
        return { ...node, children: node.children?.map(visit) };
    };
    return visit(root);
}
