import { describe, expect, it } from 'vitest';
import design from '../src/views/design/TL11.json';
import { presenceDesign, removeExpectedTime } from '../src/views/design/presence';
import { content, nodes } from '../src/views/design/types';

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
                expect(content(result)).not.toContain(pet.idPet);
                expect(content(result)).not.toMatch(/Pet \d|Pet 550e/);
                expect(content(result)).toContain('Responsável: não registrado');
            });
        }

        it(`prioriza pets a chegar, presentes e retirados em ${layout} sem reordenar a fonte`, () => {
            const pets = ['RETIRADO', 'CONFIRMADO', 'AGENDADO', 'CONFIRMADO', 'AGENDADO', 'RETIRADO'].map((situacao, index) => ({
                idAgendamento: index + 1, idPet: `pet-${index}`, nomePet: `Nome ${index}`, situacao,
            }));
            const source = [...pets];
            const result = presenceDesign(find(design[layout], 'Pets previstos'), { pets });
            const cards = nodes(result).flatMap(child => child.name === 'Grupo de presenças' ? nodes(child) : [child]);
            expect(cards.map(card => card.presencePet.idAgendamento)).toEqual([3, 5, 2, 4, 1, 6]);
            expect(pets).toEqual(source);

            const updated = pets.map(pet => pet.idAgendamento === 3 ? { ...pet, situacao: 'CONFIRMADO' } : pet);
            const refreshed = presenceDesign(find(design[layout], 'Pets previstos'), { pets: updated });
            const refreshedCards = nodes(refreshed).flatMap(child => child.name === 'Grupo de presenças' ? nodes(child) : [child]);
            expect(refreshedCards.map(card => card.presencePet.idAgendamento)).toEqual([5, 2, 3, 4, 1, 6]);
        });
    }
});
