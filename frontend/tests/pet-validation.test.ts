import { describe, expect, it } from 'vitest';
import { maskPetDate, maskPetPhone, petDateISO, validatePetField, validatePetForm, validatePetPhoto, MAX_PET_PHOTO_BYTES } from '../src/services/pet-validation';
import { createPetDraft } from '../src/services/pet-draft';

describe('pet dates and phones', () => {
  it.each(['01/02/20255', '010220255555', '20255-02-01'])('bounds pasted or typed expanded years: %s', value => {
    expect(maskPetDate(value)).toBe('01/02/2025');
  });
  it('allows gradual typing and rejects impossible and future dates', () => {
    expect(maskPetDate('0102')).toBe('01/02');
    expect(petDateISO('29/02/2024')).toBe('2024-02-29');
    for (const date of ['31/02/2024', '29/02/2025', '00/01/2025', '01/13/2025', '01/01/0000', '01/01/20255']) expect(petDateISO(date)).toBeNull();
    expect(validatePetField('nascimento', '01/01/2099')).toBe('Data inválida');
  });
  it('caps phone digits regardless of punctuation', () => {
    expect(maskPetPhone('(11) 99999-88887777')).toBe('(11) 99999-8888');
    expect(maskPetPhone('1133334444')).toBe('(11) 3333-4444');
    expect(validatePetField('contato', '(11) 123')).toContain('10 ou 11');
  });
});

describe('pet validation and organized draft', () => {
  const base = { nome: 'Bob', nascimento: '01/01/2020', raca: 'SRD' };
  it('does not require untouched optional records but validates added and partial records', () => {
    expect(validatePetForm(base, { vacinas: [0], medicamentos: [0] })).toEqual({});
    expect(validatePetForm(base, { vacinas: [1], medicamentos: [2] })).toHaveProperty('vacinas.1.vacina');
    expect(validatePetForm({ ...base, 'vacinas.0.vacina': 'V10' }, { vacinas: [0], medicamentos: [] })).toHaveProperty('vacinas.0.data');
  });
  it('rejects whitespace, numeric names, and empty custom allergy descriptions', () => {
    expect(validatePetField('nome', '12345', true)).toContain('3 letras');
    expect(validatePetField('veterinario', '  ')).toContain('Preencha');
    expect(validatePetField('obs', 'Texto livre: atenção à alimentação!')).toBe('');
    expect(validatePetForm({ ...base, 'alergia-outros': 'Sim', 'alergia-personalizada': ' ' }, { vacinas: [], medicamentos: [] })).toHaveProperty('alergia-personalizada');
  });
  it('organizes independent records, normalized dates, phones and custom allergies', () => {
    const result = createPetDraft({ ...base, contato: '(11) 99999-8888', 'vacinas.1.vacina': 'V10', 'vacinas.1.data': '29/02/2024', 'vacinas.3.vacina': 'Antirrábica', 'vacinas.3.data': '01/03/2024', 'alergia-outros': 'Sim', 'alergia-personalizada': ' Poeira ' }, ['Alergia a frango'], { vacinas: [1, 3], medicamentos: [] });
    expect(result.vacinas).toEqual([{ vacina: 'V10', data: '2024-02-29' }, { vacina: 'Antirrábica', data: '2024-03-01' }]);
    expect(result.contato).toBe('11999998888');
    expect(result.allergies).toEqual(['Alergia a frango', 'Poeira']);
    expect(Object.hasOwn(result, 'vacinas.1.vacina')).toBe(false);
  });
  it('validates photo size and supported image types', () => {
    expect(validatePetPhoto({ type: 'image/png', size: MAX_PET_PHOTO_BYTES })).toBe('');
    expect(validatePetPhoto({ type: 'image/png', size: MAX_PET_PHOTO_BYTES + 1 })).toContain('5 MB');
    expect(validatePetPhoto({ type: 'text/plain', size: 100 })).toContain('JPG');
  });
});
