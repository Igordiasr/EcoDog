import { expect, it } from 'vitest';
import design from '../src/views/design/TL05.json';
import { petCardFromPrototype } from '../src/views/components/TutorPets';

function find(node, name) {
    if (typeof node === 'string') return;
    if (node.name === name) return node;
    return node.children?.map(child => find(child, name)).find(Boolean);
}

it('preserva o card original desktop e mobile com os dados reais', () => {
    for (const screen of [design.desktop, design.mobile]) {
        const template = find(screen, 'Pet cadastrado');
        const card = petCardFromPrototype(template, { idPet: 42, nome: 'Luna', raca: 'SRD', sexo: 'F', castrado: true, dataNascimento: '2020-05-10' });
        expect(card.className).toBe(template.className);
        expect(find(card, 'Resumo do pet').className).toBe(find(template, 'Resumo do pet').className);
        expect(find(card, 'Ações do pet').className).toBe(find(template, 'Ações do pet').className);
        expect(find(card, 'Nome').children).toEqual(['Luna']);
        expect(JSON.stringify(card)).toContain('"editPetId":42');
        expect(JSON.stringify(card)).toContain('Nascimento: 10/05/2020');
        expect(JSON.stringify(card)).toContain('Sexo: F • Castrada');
        expect(JSON.stringify(card)).not.toContain('image-import-39');
        expect(find(template, 'Nome').children).toEqual(['Thor']);
    }
});
