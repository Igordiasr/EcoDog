import { expect, it } from 'vitest';
import design from '../src/views/design/TL05.json';
import { planFromPrototype } from '../src/views/components/TutorPlans';

const find = (node, name) => node?.name === name ? node : node?.children?.filter(child => typeof child !== 'string').map(child => find(child, name)).find(Boolean);
const plan = { nomePet: 'Mel', servico: 'DAYUSE', quantidadeDias: 2, diasDaSemana: [], diasAgendados: ['2026-12-01', '2026-12-02'] };

it('mantém as quatro colunas e classes da linha desktop do protótipo', () => {
    const template = find(design.desktop, 'Plano');
    const row = planFromPrototype(template, plan, 0);
    expect(row.className).toBe(template.className);
    expect(row.children.slice(0, 3).map(child => child.className)).toEqual(template.children.slice(0, 3).map(child => child.className));
    expect(row.children.slice(0, 3).map(child => child.children[0])).toEqual(['Day Use • Mel', '2', 'Consulte a EcoDog']);
    expect(row.children[3].children.map(child => child.children[0])).toEqual(['1/12', '2/12']);
    expect(row.children[3].children.every(child => child.className === 'tutor-plan-date')).toBe(true);
});
it('mantém os quatro rótulos e o card mobile do protótipo', () => {
    const template = find(design.mobile, 'Plano contratado');
    const card = planFromPrototype(template, { ...plan, servico: 'CRECHE', diasDaSemana: ['SEGUNDA', 'QUARTA'] }, 1);
    expect(card.className).toBe(template.className);
    expect(card.children.map(child => child.children[0])).toEqual(template.children.map(child => ({ ...child.children[0], id: `${child.children[0].id}-plan-1` })));
    expect(card.children.slice(0, 3).map(child => child.children[1].children[0])).toEqual(['Creche • Mel', '2', 'Segunda / Quarta']);
    expect(card.children[3].children[1].children.map(child => child.children[0])).toEqual(['1/12', '2/12']);
});
it('orienta consultar a EcoDog quando os dias não estão disponíveis', () => {
    const row = planFromPrototype(find(design.desktop, 'Plano'), { ...plan, diasAgendados: [] }, 0);
    expect(row.children[2].children).toEqual(['Consulte a EcoDog']);
    expect(row.children[3].children).toEqual(['Consulte a EcoDog']);
});
