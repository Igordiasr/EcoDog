import { expect, it } from 'vitest';
import { monitorRecordSaved, monitorRecordLocked } from '../src/views/design/monitor-records';

it('diferencia registro indisponível de registro salvo', () => {
    const record = { monitorRecord: { unavailable: true }, children: [{ name: 'Status', children: ['Escolha ainda não salva'] }] };
    expect(monitorRecordLocked(record)).toBe(true);
    expect(monitorRecordSaved(record)).toBe(false);
});
it('reconhece registros salvos no servidor ou nesta sessão', () => {
    expect(monitorRecordSaved({ children: [{ name: 'Status', children: ['Registro salvo • Participou'] }] })).toBe(true);
    expect(monitorRecordSaved({ children: [] }, { values: {} })).toBe(true);
    expect(monitorRecordSaved({ children: [{ name: 'Status', children: ['Escolha ainda não salva'] }] })).toBe(false);
});
