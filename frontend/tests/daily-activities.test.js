import { describe, expect, it } from 'vitest';
import { createDailyActivitiesApi } from '../src/api/daily-activities-api';
import { visibleDailyActivities } from '../src/viewmodels/use-daily-activities';
import { activityDuration, dailyActivitiesDesign } from '../src/views/design/daily-activities';
import { content, nodes } from '../src/views/design/types';
import design from '../src/views/design/TL12.json';

const activity = { idAtividadeDoDia: 12, nome: 'Busca de bolinha', descricao: 'Buscar e devolver a bola.', categoria: 'Recreação', horaInicio: '09:00:00', horaFim: '09:30:00', situacao: 'PENDENTE', grupos: [{ grupo: 2, petsDoGrupo: [{ idPet: 9, nome: 'Bolinha', idParticipacaoDoPet: 31, idAgendamento: 6 }] }] };
const data = { data: '2026-10-27', atividadesDoDia: [activity] };
const find = (node, name) => node.name === name ? node : nodes(node).map(child => find(child, name)).find(Boolean);

describe('Atividades do dia do monitor', () => {
    it('consulta sem parâmetro de data e conclui apenas a atividade selecionada', async () => {
        const calls = [];
        const api = createDailyActivitiesApi('http://localhost:8080', async (url, options) => {
            calls.push({ url, options });
            return new Response(options.method === 'GET' ? JSON.stringify(data) : null, { status: options.method === 'GET' ? 200 : 204 });
        }, 'token');
        expect(await api.today()).toEqual(data);
        await api.complete(12);
        expect(calls[0].url).toBe('http://localhost:8080/atividades');
        expect(calls[0].options.headers.Authorization).toBe('Bearer token');
        expect(calls[1].options.method).toBe('PUT');
        expect(JSON.parse(calls[1].options.body)).toEqual({ situacao: 'CONCLUIDA', idAtividadeDoDia: 12 });
        await expect(api.complete(-1)).rejects.toThrow('ID inválido');
    });
    it('não transforma falhas ou respostas inválidas em exemplos', async () => {
        const api = createDailyActivitiesApi('http://localhost:8080', async () => new Response(JSON.stringify({ ...data, atividadesDoDia: [{ ...activity, situacao: 'INVALIDA' }] })));
        await expect(api.today()).rejects.toThrow('Estado inválido');
        const denied = createDailyActivitiesApi('http://localhost:8080', async () => new Response('{}', { status: 403 }));
        await expect(denied.today()).rejects.toThrow('Acesso negado');
    });
    it('filtra concluídas sem esconder as não concluídas do filtro de pendentes', () => {
        const sample = { atividadesDoDia: [activity, { ...activity, idAtividadeDoDia: 13, situacao: 'CONCLUIDA' }, { ...activity, idAtividadeDoDia: 14, situacao: 'NAO_CONCLUIDA' }] };
        expect(visibleDailyActivities(sample, false).map(a => a.idAtividadeDoDia)).toEqual([12, 14]);
        expect(visibleDailyActivities(sample, true).map(a => a.idAtividadeDoDia)).toEqual([13]);
        expect(activityDuration(activity)).toBe('30 Min');
        expect(activityDuration({})).toBe('não informada');
    });
    it.each(['desktop', 'mobile'])('mantém os templates %s e substitui grupos e pets fictícios', mode => {
        const source = find(design[mode], 'Atividades');
        const result = dailyActivitiesDesign(source, { activities: [activity], activeId: 12 });
        const panel = find(result, 'Atividade expandida');
        expect(result.className).toBe(source.className);
        expect(panel.className).toBe(find(source, 'Atividade expandida').className);
        expect(panel.dailyActivity).toBe(activity);
        expect(find(result, 'Card de pet').dailyPet.idPet).toBe(9);
        expect(content(result)).toContain('Grupo Pet2 - Duração 30 Min');
        expect(content(result)).toContain('09:00 → 09:30');
        expect(content(result)).toContain('Bolinha');
        expect(content(result)).not.toMatch(/Thor|Viviane|Medicação 1|HH:mm|XX Min|ilustrativ/);
        const summary = dailyActivitiesDesign(source, { activities: [activity], activeId: null });
        expect(find(summary, 'Atividade resumida').dailyActivity).toBe(activity);
        expect(content(summary)).toContain('Busca de bolinha');
    });
    it('apresenta carregamento, erro e lista vazia sem alterar a estrutura da página', () => {
        const source = find(design.desktop, 'Atividades');
        expect(content(dailyActivitiesDesign(source, { activities: [], loading: true }))).toContain('Carregando');
        expect(content(dailyActivitiesDesign(source, { activities: [], error: 'Acesso negado.' }))).toContain('Acesso negado');
        expect(content(dailyActivitiesDesign(source, { activities: [], completed: true }))).toContain('Nenhuma atividade concluída');
    });
});
