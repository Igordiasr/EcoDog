import type { PetHealthCatalog } from './pet-health-catalog';
// Only for the DEV preview; never substitutes real catalog data.
export const petHealthExamples = (): PetHealthCatalog => ({
  vacinas: [{ id: 'example-v10', name: 'V10' }, { id: 'example-rabies', name: 'Antirrábica' }],
  medicamentos: [{ id: 'example-medication-1', name: 'Medicação 1' }, { id: 'example-medication-2', name: 'Medicação 2' }],
  alergias: [{ id: 'example-chicken', name: 'Alergia a frango' }],
});
