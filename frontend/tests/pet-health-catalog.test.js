import { describe, it, expect } from 'vitest';
import { catalogNameError } from '../src/models/pet-health-catalog';
import { createPetDraft } from '../src/viewmodels/pet-draft';
import { validatePetForm, validatePetField } from '../src/models/pet-validation';
describe('Pet health catalog and vaccine validity', () => {
    it('rejects blank and duplicate catalog names while permitting existing vaccine notation', () => {
        expect(catalogNameError('  ', [])).toBe('Informe um nome válido.');
        expect(catalogNameError('antirrabica', [{ id: '1', name: 'Antirrábica' }])).toContain('já está cadastrado');
        expect(catalogNameError('V8', [])).toBe('');
    });
    it('keeps application, validity and optional insurance separate in the draft', () => {
        const fields = { nome: 'Bob', nascimento: '01/01/2020', raca: 'SRD', convenio: ' Plano de exemplo ', 'vacinas.0.vacina': 'V10', 'vacinas.0.data': '01/02/2024', 'vacinas.0.validade': '01/02/2027' };
        expect(validatePetForm(fields, { vacinas: [0], medicamentos: [] })).toEqual({});
        expect(createPetDraft(fields, [], { vacinas: [0], medicamentos: [] }).vacinas).toEqual([{ vacina: 'V10', data: '2024-02-01', validade: '2027-02-01' }]);
        expect(createPetDraft(fields, [], { vacinas: [0], medicamentos: [] }).convenio).toBe('Plano de exemplo');
        expect(validatePetField('validade', '31/02/2027')).toBe('Data inválida');
        expect(validatePetField('validade', '01/02/12027')).toBe('Data inválida');
        expect(validatePetField('validade', '')).toBe('');
    });
});
