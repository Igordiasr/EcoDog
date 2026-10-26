import { petDateISO, petRecordFields, type PetRecordIds } from './pet-validation';
export const petChoices = { sexo: ['M', 'F'], castrado: ['Sim', 'Não'] } as const;

// Frontend draft only: the backend adapter will map and validate its contract.
export function createPetDraft(fields: Record<string, string>, allergies: string[], records?: PetRecordIds) {
  const result: Record<string, unknown> = { ...fields, sexo: petChoices.sexo.find(value => value === fields.sexo) ?? '', castrado: petChoices.castrado.find(value => value === fields.castrado) ?? '', allergies: [...allergies] };
  if (!records) return result;
  for (const key of Object.keys(result)) if (key.includes('.') || key.startsWith('alergia-')) delete result[key];
  for (const key of ['nome', 'raca', 'veterinario', 'convenio']) if (typeof result[key] === 'string') result[key] = result[key].trim();
  result.nascimento = petDateISO(fields.nascimento || '') || '';
  result.contato = (fields.contato || '').replace(/\D/g, '');
  for (const kind of ['vacinas', 'medicamentos'] as const) result[kind] = records[kind].filter(id => petRecordFields[kind].some(key => !!fields[`${kind}.${id}.${key}`]?.trim())).map(id => ({ ...Object.fromEntries(petRecordFields[kind].map(key => [key, key === 'data' ? petDateISO(fields[`${kind}.${id}.${key}`]) : (fields[`${kind}.${id}.${key}`] || '').trim()])), ...(kind === 'vacinas' && fields[`${kind}.${id}.validade`]?.trim() ? { validade: petDateISO(fields[`${kind}.${id}.validade`]) } : {}) }));
  result.allergies = [...new Set([...allergies, ...(fields['alergia-outros'] === 'Sim' && fields['alergia-personalizada']?.trim() ? [fields['alergia-personalizada'].trim()] : [])])];
  return result;
}
