import { describe, expect, it } from 'vitest';
import design from '../src/views/design/TL11.json';
import { presenceDesign, removeExpectedTime } from '../src/views/design/presence';

function find(node, name) {
    if (typeof node === 'string') return;
    if (node.name === name) return node;
    return node.children?.map(child => find(child, name)).find(Boolean);
}

describe('Check-in e check-out sem horário previsto', () => {
    for (const layout of ['desktop', 'mobile']) {
        it(`remove o bloco completo em ${layout} sem alterar o protótipo original`, () => {
            const result = removeExpectedTime(design[layout]);
            expect(find(result, 'Horário previsto')).toBeUndefined();
            expect(find(result, 'Check de entrada e saída')).toBeDefined();
            expect(find(design[layout], 'Horário previsto')).toBeDefined();
        });

        for (const situacao of ['AGENDADO', 'CONFIRMADO', 'RETIRADO']) {
            it(`preserva os registros reais em ${layout} para ${situacao}`, () => {
                const pet = { idAgendamento: 1, idPet: '550e8400-e29b-41d4-a716-446655440000', nomePet: 'Mel', situacao, dataEntradaRaw: '2026-11-16T09:15:00', dataSaidaRaw: '2026-11-16T16:30:00' };
                const result = presenceDesign(find(design[layout], 'Pets previstos'), { pets: [pet] });
                expect(find(result, 'Horário previsto')).toBeUndefined();
                const serialized = JSON.stringify(result);
                expect(serialized).toContain('Mel');
                expect(serialized).toContain(situacao === 'AGENDADO' ? 'ainda não registrada' : '09:15');
                expect(serialized).toContain(situacao === 'RETIRADO' ? '16:30' : 'pendente');
                expect(serialized).toContain('Check de entrada e saída');
            });
        }
    }
});
