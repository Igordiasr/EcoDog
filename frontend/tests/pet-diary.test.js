import { describe, expect, it } from 'vitest';
import design from '../src/views/design/TL07.json';
import { integratedPetDiaryDesign } from '../src/views/design/pet-diary';

const data = { idPet: 7, data: '2026-11-08', resumo: { statusRefeicao: 'Refeição concluída.', statusEngajamento: 'Uma atividade concluída.' }, atividades: [{ descricao: 'Passeio no parque' }], medicacoes: [{ nome: 'Remédio real', status: 'TOMOU' }], observacoes: 'Descansou após o passeio.' };

describe('Diário do tutor', () => {
    for (const layout of ['desktop', 'mobile']) {
        it(`preenche o protótipo ${layout} sem registros fictícios`, () => {
            const result = JSON.stringify(integratedPetDiaryDesign(design[layout], { data, pet: { nome: 'Mel', raca: 'SRD' } }, data.data));
            expect(result).toContain('Diário de Mel');
            expect(result).toContain('Passeio no parque');
            expect(result).toContain('Remédio real');
            expect(result).toContain('Descansou após o passeio.');
            expect(result).not.toContain('Participou');
            expect(result).not.toContain('Ex.: Thor');
            expect(result).toContain('Registro de refeição');
        });
        it(`exibe ausência de registros em ${layout}`, () => {
            const result = JSON.stringify(integratedPetDiaryDesign(design[layout], { data: null }, data.data));
            expect(result).toContain('Sem atividades registradas.');
            expect(result).toContain('Sem medicações registradas.');
        });
    }
});
