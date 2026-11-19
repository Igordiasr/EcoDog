import { expect, it } from 'vitest';
import { monitorUnavailableReason } from '../src/views/design/monitor-availability';
const petId = '550e8400-e29b-41d4-a716-446655440000';
const otherPetId = '550e8400-e29b-41d4-a716-446655440001';

it('informa que o pet ainda não chegou', () => {
    expect(monitorUnavailableReason([{ idPet: petId, situacao: 'AGENDADO' }], petId)).toContain('Aguarde o check-in');
});
it('informa que o pet já saiu', () => {
    expect(monitorUnavailableReason([{ idPet: petId, situacao: 'RETIRADO' }], petId)).toContain('após o check-out');
});
it('libera alterações apenas para presença ativa do pet selecionado', () => {
    expect(monitorUnavailableReason([{ idPet: petId, situacao: 'CONFIRMADO' }], petId)).toBe('');
    expect(monitorUnavailableReason([{ idPet: otherPetId, situacao: 'CONFIRMADO' }], petId)).toContain('não possui uma presença ativa');
    expect(monitorUnavailableReason([{ idPet: petId, situacao: 'CONFIRMADO', dataSaidaRaw: '2026-11-16T17:00:00' }], petId)).toContain('já saiu');
});
