import { expect, it } from 'vitest';
import { selectedPetsSentence } from '../src/viewmodels/booking-presentation';
it('ajusta a concordância ao número de pets selecionados', () => {
    expect(selectedPetsSentence(['Luna'])).toBe('Luna está selecionado para essa auventura.');
    expect(selectedPetsSentence(['Luna', 'Thor'])).toBe('Luna, Thor estão selecionados para essa auventura.');
    expect(selectedPetsSentence([])).toBe('Nenhum pet selecionado para essa auventura.');
});
