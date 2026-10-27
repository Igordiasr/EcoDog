import { content, nodes } from './types';
import { findDesignNode } from './structure-booking';

export function integratedPetDiaryDesign(root, model, day) {
    const { data, pet } = model;
    const text = (template, value, id) => ({ ...template, id: `${template.id}-${id}`, children: [value] });
    const visit = node => {
        if (typeof node === 'string') return node;
        if (node.name === 'Apresentação') return { ...node, children: node.children?.map(c => typeof c !== 'string' && c.name === 'Título' ? text(c, `Diário de ${pet?.nome || 'seu pet'}`, 'pet') : c) };
        if (node.name === 'Pet') return text(node, pet ? `${pet.nome} • ${pet.raca || ''}` : 'Selecione um pet', 'pet');
        if (node.name === 'Seletor de data') return { ...node, children: node.children?.map(c => { if (typeof c === 'string') return c; return { ...c, children: c.children?.map(x => typeof x !== 'string' && x.name === 'Ação' && /\d/.test(content(x)) ? text(x, day.split('-').reverse().join('/'), 'date') : x) }; }) };
        if (node.name === 'Painel') {
            const title = nodes(node).find(c => c.name === 'Título');
            const kind = content(title || '');
            if (kind === 'Refeição') return { ...node, children: [title, text(findDesignNode(node, 'Descrição'), data?.resumo.statusRefeicao || 'Sem refeições registradas.', 'meal')] };
            if (kind === 'Atividades') {
                const group = findDesignNode(node, 'Atividades do dia');
                const template = group && nodes(group)[0];
                const entries = (data?.atividades || []).map((a, index) => ({ ...template, id: `${template.id}-${index}`, children: [text(findDesignNode(template, 'Descrição'), a.descricao, index)] }));
                return { ...node, children: [title, text(findDesignNode(node, 'Descrição'), data?.resumo.statusEngajamento || 'Sem participação registrada.', 'summary'), ...(group ? [{ ...group, children: entries }] : [])] };
            }
            if (kind === 'Medicações') {
                const group = findDesignNode(node, 'Registros de medicação');
                const template = group && nodes(group)[0];
                return { ...node, children: [title, ...(group ? [{ ...group, children: (data?.medicacoes || []).map((m, index) => ({ ...template, id: `${template.id}-${index}`, children: [text(findDesignNode(template, 'Nome'), m.nome, index), text(findDesignNode(template, 'Status'), { TOMOU: 'Tomou', NAO_TOMOU: 'Não tomou', PENDENTE: 'Pendente' }[m.status], index)] })) }] : [])] };
            }
            if (kind === 'Observações') return { ...node, children: [title, { tag: 'p', className: 'w-full whitespace-pre-line', children: [data?.observacoes || 'Sem observações registradas.'] }] };
        }
        return { ...node, children: node.children?.map(visit) };
    };
    return visit(root);
}
