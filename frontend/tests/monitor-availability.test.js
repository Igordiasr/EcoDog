import { expect, it } from 'vitest';
import { monitorUnavailableReason } from '../src/views/design/monitor-availability';

it('informa que o pet ainda não chegou', () => {
    expect(monitorUnavailableReason([{ idPet: 1, situacao: 'AGENDADO' }], 1)).toContain('Aguarde o check-in');
});
it('informa que o pet já saiu', () => {
    expect(monitorUnavailableReason([{ idPet: 1, situacao: 'RETIRADO' }], 1)).toContain('após o check-out');
});
it('libera alterações apenas para presença ativa do pet selecionado', () => {
    expect(monitorUnavailableReason([{ idPet: 1, situacao: 'CONFIRMADO' }], 1)).toBe('');
    expect(monitorUnavailableReason([{ idPet: 2, situacao: 'CONFIRMADO' }], 1)).toContain('não possui uma presença ativa');
    expect(monitorUnavailableReason([{ idPet: 1, situacao: 'CONFIRMADO', dataSaidaRaw: '2026-11-16T17:00:00' }], 1)).toContain('já saiu');
});
