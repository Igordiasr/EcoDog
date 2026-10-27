import { describe, expect, it, vi } from 'vitest';
import { createPetsApi } from '../src/api/pets-api';
import { createPetDiaryApi } from '../src/api/pet-diary-api';
import { createDashboardApi } from '../src/api/dashboard-api';
import { validateBudgetDraft } from '../src/api/booking-api';
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
describe('SPEC-03–07 contract boundaries', () => {
    it('lists pets with server IDs and never invents detail fields', async () => {
        const fetcher = vi.fn(async () => json([{ idPet: 3, nome: 'Mel', raca: 'SRD', sexo: 'F', castrado: false, dataNascimento: '2020-01-02' }]));
        const pets = await createPetsApi('http://localhost:8080', fetcher).list(12);
        expect(pets[0].idPet).toBe(3);
        expect(fetcher.mock.calls[0][0].toString()).toContain('/pets/12');
    });
    it('rejects a diary for the wrong pet or date', async () => {
        const fetcher = vi.fn(async () => json({ idPet: 4, data: '2026-10-26', resumo: {}, atividades: [], medicacoes: [], observacoes: '' }));
        await expect(createPetDiaryApi('http://localhost:8080', fetcher).day(3, '2026-10-26')).rejects.toThrow(/diferente/);
    });
    it('does not fabricate dashboard individual records from aggregates', async () => {
        const fetcher = vi.fn(async () => json({ kpiReceitas: [], planosAtivos: { planosAtivos: 0 }, agendamentosPorServico: [], graficoReceita: [], graficoNovosServicos: [], graficoContratosPorServico: [], ultimasMovimentacoes: [] }));
        const result = await createDashboardApi('http://localhost:8080', fetcher).summary();
        expect(result.planosAtivos).toBe(0);
        expect('pets' in result).toBe(false);
    });
    it('rejects repeated IDs/dates from a booking budget draft', () => {
        expect(() => validateBudgetDraft({ idServico: 2, idsPet: [1, 1], datasUtilizacao: ['2026-11-02'] })).toThrow();
    });
});
