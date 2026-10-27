import { content, nodes } from './types';

export const dailyActivityStatus = situation => ({ PENDENTE: 'Pendente', CONCLUIDA: 'Concluída', NAO_CONCLUIDA: 'Não concluída' }[situation]);
const time = value => value?.match(/^\d{2}:\d{2}/)?.[0] || 'Não informado';
export function activityDuration(activity) {
    const minutes = value => /^\d{2}:\d{2}/.test(value || '') ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : null;
    const start = minutes(activity.horaInicio), end = minutes(activity.horaFim);
    return start !== null && end !== null && end > start ? `${end - start} Min` : 'não informada';
}

function petCard(template, pet, key) {
    const map = (node, ancestors = []) => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id}-${key}`, ...(node.name === 'Card de pet' ? { dailyPet: pet } : {}) };
        if (node.name === 'Foto do pet') return { ...copy, className: node.className.replace(/bg-\[url\([^]*?\)\]/g, ''), children: [] };
        const inSection = name => ancestors.some(parent => parent.name === name);
        let value;
        if (inSection('Dados do pet')) value = node.name === 'Rótulo' ? pet.nome : node.name === 'Descrição' ? `Pet ${pet.idPet}` : undefined;
        if (inSection('Cuidado') && node.name === 'Descrição') value = 'Consulte os detalhes do pet.';
        return { ...copy, children: value !== undefined ? [value] : node.children?.map(child => map(child, [...ancestors, node])) };
    };
    return map(template);
}

function activityCard(template, activity) {
    const key = activity.idAtividadeDoDia;
    const groupTemplate = nodes(template).find(child => child.name === 'Grupo de pets');
    const groupCard = (group, index) => {
        const map = node => {
            if (typeof node === 'string') return node;
            const copy = { ...node, id: `${node.id}-${key}-${index}` };
            if (node.name === 'Grupo e duração') return { ...copy, children: [`${group.grupo === 0 ? 'Sem grupo' : `Grupo Pet${group.grupo}`} - Duração ${activityDuration(activity)}`] };
            if (node.name === 'Quantidade') return { ...copy, children: [`${group.petsDoGrupo.length} aulunos`] };
            if (node.name === 'Aulunos do grupo') return { ...copy, children: group.petsDoGrupo.map(pet => petCard(nodes(node)[0], pet, `${key}-${index}-${pet.idParticipacaoDoPet}`)) };
            return { ...copy, children: node.children?.map(map) };
        };
        return map(groupTemplate);
    };
    const map = (node, ancestors = []) => {
        if (typeof node === 'string') return node;
        const copy = { ...node, id: `${node.id}-${key}`, ...(/Atividade expandida|Atividade resumida/.test(node.name) ? { dailyActivity: activity } : {}) };
        const inSection = name => ancestors.some(parent => parent.name === name);
        let value;
        if (node.name === 'Título' && inSection('Título e horário') || node.name === 'Rótulo' && ancestors.at(-1)?.name === 'Identificação da atividade') value = activity.nome;
        if (node.name === 'Valor' && inSection('Horário')) value = `${time(activity.horaInicio)} → ${time(activity.horaFim)}`;
        if (node.name === 'Horário' && inSection('Horário e situação')) value = `${time(activity.horaInicio)} → ${time(activity.horaFim)} • ${dailyActivityStatus(activity.situacao)}`;
        if (node.name === 'Status') value = dailyActivityStatus(activity.situacao);
        if (node.name === 'Descrição' && inSection('Instrução da brincadeira')) value = activity.descricao || 'Descrição não informada.';
        if (node.name === 'Descrição' && content(node).startsWith('Composição dos grupos')) value = activity.categoria ? `Categoria: ${activity.categoria}` : 'Categoria não informada.';
        if (node.name === 'Descrição' && inSection('Conclusão da atividade')) value = `Terminou a auventura? Registre a conclusão de ${activity.nome}.`;
        let insertedGroups = false;
        return { ...copy, children: value !== undefined ? [value] : node.children?.flatMap(child => {
            if (typeof child !== 'string' && child.name === 'Grupo de pets') {
                if (insertedGroups) return [];
                insertedGroups = true;
                return activity.grupos.map(groupCard);
            }
            return [map(child, [...ancestors, node])];
        }) };
    };
    return map(template);
}

export function dailyActivitiesDesign(node, daily, userName) {
    if (node.name === 'Atividades') {
        const expanded = nodes(node).find(child => child.name === 'Atividade expandida');
        const summary = nodes(node).find(child => child.name === 'Atividade resumida');
        return { ...node, children: daily.activities.length ? daily.activities.map(activity => activityCard(activity.idAtividadeDoDia === daily.activeId ? expanded : summary, activity)) : [{ tag: 'p', name: 'Estado das atividades', className: 'w-full text-[var(--text)]', children: [daily.loading ? 'Carregando atividades…' : daily.error || (daily.completed ? 'Nenhuma atividade concluída hoje.' : 'Nenhuma atividade pendente para hoje.')] }] };
    }
    if (node.name === 'Descrição' && content(node).startsWith('Dia:')) {
        const day = daily.data?.data;
        return { ...node, children: [`Dia: ${day ? `${day.slice(8, 10)}/${day.slice(5, 7)}` : '…'}${userName ? ` • Responsável: ${userName}` : ''}`] };
    }
    if (node.name === 'Descrição' && content(node).startsWith('Voltar para Check-in')) return { ...node, children: [`Voltar para Check-in / out • mostrando ${daily.completed ? 'concluídas' : 'pendentes'}`] };
    return node;
}
