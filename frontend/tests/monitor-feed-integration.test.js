import { describe, expect, it, vi } from 'vitest';
import { createMonitorFeedApi } from '../src/api/monitor-feed-api';
import { integratedMonitorDesign, isMonitorRecord, monitorRecordKey, monitorRecordLocked, monitorRecordValues } from '../src/views/design/monitor-records';
import design from '../src/views/design/TL10.json';
import diaryDesign from '../src/views/design/TL07.json';
import { integratedPetDiaryDesign } from '../src/views/design/pet-diary';
import { content } from '../src/views/design/types';

describe('monitor feed integration', () => {
    for (const viewport of ['desktop', 'mobile']) it(`keeps prototype fields visible when ${viewport} has no scheduled records`, () => {
        const root = integratedMonitorDesign(design[viewport], { data: { pet: { nome: 'Mel' }, activities: [], medication: [] } });
        const records = [];
        const visit = node => { if (typeof node === 'string') return; if (isMonitorRecord(node)) records.push(node); node.children?.forEach(visit); };
        visit(root);
        expect(records.length).toBeGreaterThan(3);
        expect(records.filter(r => r.monitorRecord.kind !== 'observation').every(r => r.monitorRecord.unavailable && monitorRecordLocked(r))).toBe(true);
        expect(content(root)).not.toContain('Mariana Souza');
    });
    for (const viewport of ['desktop', 'mobile']) it(`shows saved backend data in the tutor ${viewport} diary`, () => {
        const root = integratedPetDiaryDesign(diaryDesign[viewport], { pet: { nome: 'Mel', raca: 'SRD' }, data: { resumo: { statusRefeicao: 'Se alimentou', statusEngajamento: 'Participou' }, atividades: [{ descricao: 'Passeio: participou' }], medicacoes: [{ nome: 'Remédio real', status: 'TOMOU' }], observacoes: 'Passeio: brincou com energia' } }, '2026-10-27');
        expect(content(root)).toContain('Passeio: brincou com energia');
        expect(content(root)).toContain('Remédio real');
        expect(content(root)).not.toContain('Ex.: Thor');
    });
    it('uses Swagger paths, authenticated requests and participation IDs', async () => {
        const request = vi.fn(async () => new Response('{}', { status: 200 }));
        const api = createMonitorFeedApi('http://localhost:8080', request, 'token');
        await api.updateActivity(9, 42, 'NAO_PARTICIPOU', 'Recusou alimento');
        expect(request.mock.calls[0][0]).toBe('http://localhost:8080/feed-monitor/pet/9/atividades/42');
        expect(request.mock.calls[0][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ situacao: 'NAO_PARTICIPOU', observacao: 'Recusou alimento' }) });
        await api.updateMedication(9, 73, 'TOMOU', '');
        expect(request.mock.calls[1][0]).toContain('/pet/9/medicacoes/73');
        await api.observation(9, 'Dia tranquilo');
        expect(request.mock.calls[2][1].method).toBe('POST');
    });
    it('rejects missing justifications and invalid observations before requesting', () => {
        const request = vi.fn();
        const api = createMonitorFeedApi('http://localhost:8080', request);
        expect(() => api.updateActivity(9, 42, 'NAO_PARTICIPOU', '')).toThrow('justificativa');
        expect(() => api.updateMedication(9, 73, 'NAO_TOMOU', ' ')).toThrow('justificativa');
        expect(() => api.observation(9, 'x'.repeat(201))).toThrow('200');
        expect(request).not.toHaveBeenCalled();
    });
    for (const viewport of ['desktop', 'mobile']) it(`populates ${viewport} templates with real records, not prototype history`, () => {
        const root = integratedMonitorDesign(design[viewport], { data: { pet: { nome: 'Mel', raca: 'SRD', nomeTutor: 'Ana' }, activities: [{ idParticipacaoDoPet: 42, nomeAtividade: 'Almoço', categoriaAtividade: 'REFEICAO', situacao: 'PENDENTE' }, { idParticipacaoDoPet: 43, nomeAtividade: 'Passeio', categoriaAtividade: 'RECREACAO', situacao: 'PARTICIPOU' }], medication: [{ idMedicacaoDoDia: 73, nomeMedicacao: 'Remédio', status: 'PENDENTE' }] } });
        const records = [];
        const visit = node => { if (typeof node === 'string') return; if (isMonitorRecord(node)) records.push(node); node.children?.forEach(visit); };
        visit(root);
        expect(records.map(monitorRecordKey)).toEqual(['meal-42', 'activity-43', 'medication-73', 'observation-day']);
        expect(monitorRecordLocked(records[0])).toBe(false);
        expect(monitorRecordLocked(records[1])).toBe(true);
        expect(monitorRecordValues(records[0], {}).observacoes).toBe('');
        expect(monitorRecordValues(records[0], {}).refeicao).toBe('Se alimentou');
        expect(monitorRecordValues(records[2], {}).medicacao).toBe('Tomou');
        expect(monitorRecordValues(records[0], { 'monitor.meal-42.refeicao': 'Recusou' }).refeicao).toBe('Recusou');
    });
});
