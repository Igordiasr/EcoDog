import { expect, it } from 'vitest';
import { createMonitorFeedApi } from '../src/api/monitor-feed-api';
import { integratedMonitorDesign } from '../src/views/design/monitor-records';
import design from '../src/views/design/TL10.json';

const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

it('consome foto opcional sem exigir mudanças no backend atual', async () => {
    for (const fotoUrl of [undefined, null, 'https://example.com/mel.webp']) {
        const api = createMonitorFeedApi('http://localhost:8080', async () => response({ nome: 'Mel', fotoUrl }));
        expect((await api.pet(1)).fotoUrl).toBe(fotoUrl || null);
    }
});

it('envia somente o PUT documentado e usa o retorno do registro', async () => {
    const calls = [];
    const api = createMonitorFeedApi('http://localhost:8080', async (url, options) => {
        calls.push({ url, options });
        return response({ idParticipacaoDoPet: 9, nomeAtividade: 'Passeio', categoriaAtividade: 'ATIVIDADE', situacao: 'PARTICIPOU', observacao: 'Retorno do servidor' });
    });
    expect((await api.updateActivity(1, 9, 'PARTICIPOU', 'Observação enviada')).observacao).toBe('Retorno do servidor');
    expect(calls).toHaveLength(1);
    expect(calls[0].options.method).toBe('PUT');
    expect(JSON.parse(calls[0].options.body)).toEqual({ situacao: 'PARTICIPOU', observacao: 'Observação enviada' });
});

it('valida justificativas e observações gerais antes de enviar', async () => {
    const api = createMonitorFeedApi('http://localhost:8080', async () => { throw new Error('Não deveria enviar'); });
    expect(() => api.updateActivity(1, 9, 'NAO_PARTICIPOU', '')).toThrow('justificativa');
    expect(() => api.observation(1, 'a'.repeat(201))).toThrow('200');
});

for (const layout of ['desktop', 'mobile']) {
    it(`remove a foto ilustrativa e mantém template vazio em ${layout}`, () => {
        const result = integratedMonitorDesign(design[layout], { data: { pet: { nome: 'Mel' }, activities: [], medication: [] } });
        expect(JSON.stringify(result)).toContain('Foto do pet não disponível');
        const photos = [];
        const visit = node => { if (typeof node === 'string') return; if (node.className?.includes('monitor-pet-photo')) photos.push(node); node.children?.forEach(visit); };
        visit(result);
        expect(photos.length).toBeGreaterThan(0);
        expect(photos.every(node => !node.src && !node.className.includes('url('))).toBe(true);
    });
}
