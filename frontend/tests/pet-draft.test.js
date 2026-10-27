import { describe, expect, it } from 'vitest';
import { createPetDraft } from '../src/viewmodels/pet-draft';
describe('pet registration draft', () => {
    it('preserves fields and the latest selections without mutating the draft', () => {
        const fields = { nome: 'Bob', sexo: 'F', castrado: 'Não' };
        const allergies = ['Poeira'];
        const draft = createPetDraft(fields, allergies);
        expect(draft).toEqual({ ...fields, allergies: ['Poeira'] });
        expect(draft.allergies).not.toBe(allergies);
    });
    it('does not invent selections for missing or unknown options', () => {
        expect(createPetDraft({ sexo: 'unknown' }, [])).toEqual({ sexo: '', castrado: '', allergies: [] });
    });
});
