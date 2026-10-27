import { describe, expect, it } from 'vitest';
import { createPresenceApi } from '../src/api/presence-api';
import { canCheckIn, canCheckOut, presenceDay } from '../src/viewmodels/use-presence';
import { presenceDesign } from '../src/views/design/presence';
import design from '../src/views/design/TL11.json';
import { nodes, content } from '../src/views/design/types';

describe('Integração de presenças', () => {
    it('consulta a data com autenticação e envia apenas o responsável no PATCH', async () => {
        const calls = [];
        const api = createPresenceApi('http://localhost:8080', async (url, options) => {
            calls.push({ url, options });
            return new Response(options.method === 'GET' ? '[]' : null, { status: options.method === 'GET' ? 200 : 204 });
        }, 'token');
        expect(await api.list('2026-10-27')).toEqual([]);
        await api.checkIn(7, ' Maria ');
        await api.checkOut(7, 'José');
        expect(calls[0].url).toContain('data=2026-10-27');
        expect(calls[1].url).toContain('/7/check-in');
        expect(calls[1].options.headers.Authorization).toBe('Bearer token');
        expect(JSON.parse(calls[1].options.body)).toEqual({ responsavel: 'Maria' });
        expect(calls[2].url).toContain('/7/check-out');
        expect(() => api.checkIn(7, ' ')).toThrow('responsável');
    });
    it('não usa horários previstos como prova de entrada e respeita o fuso', () => {
        expect(canCheckOut({ situacao: 'AGENDADO', dataEntradaRaw: '2026-10-27T08:00:00' })).toBe(false);
        expect(canCheckIn({ situacao: 'AGENDADO' })).toBe(true);
        expect(canCheckOut({ situacao: 'CONFIRMADO', dataEntradaRaw: '2026-10-27T08:00:00' })).toBe(true);
        expect(canCheckOut({ situacao: 'RETIRADO', dataEntradaRaw: 'a', dataSaidaRaw: 'b' })).toBe(false);
        expect(presenceDay(new Date('2026-10-27T01:00:00Z'))).toBe('2026-10-26');
    });
    it.each(['desktop', 'mobile'])('substitui exemplos preservando os cartões %s', mode => {
        const find = (node, name) => node.name === name ? node : nodes(node).map(child => find(child, name)).find(Boolean);
        const source = find(design[mode], 'Pets previstos');
        const pet = { idAgendamento: 42, idPet: 9, nomePet: 'Bolinha', situacao: 'AGENDADO' };
        const result = presenceDesign(source, { pets: [pet] });
        expect(result.className).toBe(source.className);
        expect(content(result)).toContain('Bolinha');
        expect(content(result)).not.toMatch(/Viviane|Thor|Medicação 1|SRD/);
        expect(find(result, 'Painel').presencePet).toBe(pet);
        expect(content(presenceDesign(source, { pets: [], loading: false }))).toContain('Nenhum pet');
    });
});
