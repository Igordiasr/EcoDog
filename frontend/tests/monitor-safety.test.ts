import { describe, expect, it } from 'vitest';
import { monitorRecordDesign, monitorRecordKey, monitorRecordLocked, type MonitorSavedRecord } from '../src/design/monitor-records';
import { content, type DesignNode } from '../src/design/types';

const record = (status = ''): DesignNode => ({ tag: 'div', name: 'Registro de alimentação', className: '', children: [
  { tag: 'div', name: 'Identificação do registro', className: '', children: [{ tag: 'span', className: '', children: ['Refeição de teste'] }] },
  { tag: 'span', name: 'Status', className: '', children: [status] },
] });

describe('RF-042 monitor UI protection', () => {
  it('allows an unsaved draft and locks an illustrative previously saved example', () => {
    expect(monitorRecordLocked(record())).toBe(false);
    expect(monitorRecordLocked(record('Registro salvo • exemplo'))).toBe(true);
  });
  it('locks session-local snapshots without treating them as server history', () => {
    const saved: MonitorSavedRecord = { local: true, values: { refeicao: 'Recusou', observacoes: 'Original' } };
    expect(monitorRecordLocked(record(), saved)).toBe(true);
    const fields = { [`monitor.${monitorRecordKey(record())}.refeicao`]: 'Se alimentou' };
    const view = monitorRecordDesign(record(), fields, saved);
    expect(content(view)).toContain('Salvo apenas na prévia (memória) • Recusou');
    expect(content(view)).not.toContain('Alterações ainda não salvas');
    expect(saved.values).toEqual({ refeicao: 'Recusou', observacoes: 'Original' });
  });
  it('marks a saved observation even if its design had no status container', () => {
    const node: DesignNode = { tag: 'div', name: 'Observações gerais', className: '', children: [] };
    expect(content(monitorRecordDesign(node, {}, { local: true, values: { observacoes: 'Anotação' } }))).toContain('Salvo apenas na prévia (memória)');
  });
});
