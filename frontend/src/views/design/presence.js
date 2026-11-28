import { content, nodes } from './types';
import { petPhotoDesign } from './pet-photo';

const status = pet => ({ AGENDADO: 'Aguardando entrada', CONFIRMADO: 'Em permanência', RETIRADO: 'Saída registrada', CANCELADO: 'Cancelado' }[pet.situacao]);
const statusOrder = { AGENDADO: 0, CONFIRMADO: 1, RETIRADO: 2, CANCELADO: 3 };
const time = raw => raw?.match(/T(\d{2}:\d{2})/)?.[1] || 'não registrada';

export function removeExpectedTime(node) {
    if (typeof node === 'string') return node;
    return { ...node, children: node.children?.filter(child => typeof child === 'string' || child.name !== 'Horário previsto').map(removeExpectedTime) };
}

function petPanel(template, pet) {
    const map = (node, ancestors = []) => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id}-${pet.idAgendamento}` };
        const inSection = name => ancestors.some(parent => parent.name === name);
        let value;
        if (node.name === 'Foto do pet') return petPhotoDesign(copy, pet.fotoUrl, pet.nomePet);
        if (node.name === 'Nome' && inSection('Dados do auluno')) value = pet.nomePet;
        if (node.name === 'Descrição' && inSection('Dados do auluno')) {
            if (content(node).startsWith('Pet ')) return null;
            value = `Responsável: ${pet.tutorCheckout || pet.tutorCheckin || 'não registrado'}`;
        }
        if (node.name === 'Rótulo' && inSection('Status')) value = status(pet);
        if (node.name === 'Descrição' && inSection('Orientações')) value = inSection('Cuidados') ? [pet.racaoMarca && `Ração: ${pet.racaoMarca}`, pet.quantidade && `Quantidade: ${pet.quantidade}`].filter(Boolean).join(' • ') || 'Não informado' : `Pertences: ${pet.pertences || 'não informados'}`;
        if (node.name === 'Descrição' && inSection('Check de entrada e saída')) value = `Entrada: ${pet.situacao === 'AGENDADO' ? 'ainda não registrada' : time(pet.dataEntradaRaw)} • Saída: ${pet.situacao === 'RETIRADO' ? time(pet.dataSaidaRaw) : 'pendente'}`;
        return { ...copy, ...(node.name === 'Painel' ? { presencePet: pet } : {}), children: value !== undefined ? [value] : node.children?.map(child => map(child, [...ancestors, node])).filter(child => child !== null) };
    };
    return map(removeExpectedTime(template));
}

export function presenceDesign(node, presence) {
    if (node.name === 'Pets previstos') {
        const groups = nodes(node).filter(child => child.name === 'Grupo de presenças');
        const panels = groups.length ? groups.flatMap(nodes) : nodes(node);
        const panelFor = pet => panels.find(panel => content(panel).includes(status(pet))) || panels[0];
        if (!presence.pets.length) return { ...node, children: [{ tag: 'p', name: 'Presenças', className: 'w-full text-[var(--text)]', children: [presence.loading ? 'Carregando presenças…' : presence.error || 'Nenhum pet previsto para hoje.'] }] };
        const cards = [...presence.pets].sort((a, b) => statusOrder[a.situacao] - statusOrder[b.situacao]).map(pet => petPanel(panelFor(pet), pet));
        if (!groups.length) return { ...node, children: cards };
        const rows = [];
        for (let i = 0; i < cards.length; i += 2) rows.push({ ...groups[0], id: `presence-row-${i}`, children: cards.slice(i, i + 2) });
        return { ...node, children: rows };
    }
    if (node.name === 'Indicador de presença') {
        const label = content(nodes(node).find(child => child.name === 'Status'));
        return { ...node, children: node.children.map(child => child.name === 'Quantidade' ? { ...child, children: [String(presence.pets.filter(pet => status(pet) === label).length)] } : child) };
    }
    if (node.name === 'Rótulo' && content(node).startsWith('Hoje •')) return { ...node, children: [`Hoje • ${presence.day.slice(8)}/${presence.day.slice(5, 7)}`] };
    return node;
}
