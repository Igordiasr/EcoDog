import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { structureBookingDesign, findDesignNode } from '../src/design/structure-booking';
import { content, type DesignScreen } from '../src/design/types';

const structure: DesignScreen = JSON.parse(readFileSync('src/design/TL09.json', 'utf8'));
const scheduling: DesignScreen = JSON.parse(readFileSync('src/design/TL03.json', 'utf8'));
it('reutiliza apenas serviços e calendário, sem componentes financeiros, nas duas variantes', () => {
  for (const mobile of [false, true]) {
    const original = mobile ? findDesignNode(structure.mobile, 'Calendário de vagas')! : findDesignNode(structure.desktop, 'calendario')!;
    const result = structureBookingDesign(original, scheduling, mobile);
    expect(findDesignNode(result, 'Calendário de agosto')).toEqual(findDesignNode(mobile ? scheduling.steps[1] : scheduling.desktop, 'Calendário de agosto'));
    expect(content(result)).toContain('Creche');
    expect(content(result)).toContain('Hotel');
    expect(content(result)).toContain('DayUse');
    expect(content(result)).not.toContain('R$');
    expect(findDesignNode(result, 'Valor previsto')).toBeUndefined();
  }
});
