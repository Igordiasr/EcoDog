import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ScheduledPetDays } from '../src/views/components/ScheduledPetDays';
const render = (records, error = '', example = false) => renderToStaticMarkup(createElement(ScheduledPetDays, { records, error, example }));
describe('scheduled days as independent blocks', () => {
    it('shows only unique ordered dates, without booking details', () => {
        const records = [
            { id: 'later', petId: 'pet-b', date: '2027-02-15', service: 'Creche', valid: true },
            { id: 'first', petId: 'pet-a', date: '2027-01-05', service: 'Creche', valid: true },
            { id: 'second', petId: 'pet-b', date: '2027-01-05', service: 'Creche', valid: true },
        ];
        const before = structuredClone(records), html = render(records);
        expect(html.match(/class="scheduled-day-card"/g)).toHaveLength(2);
        expect(html.indexOf('05/01/2027')).toBeLessThan(html.indexOf('15/02/2027'));
        expect(html).not.toMatch(/Agendamento:|Identificador do pet:|scheduled-day-count|<li|<p/);
        expect(html).not.toContain('pet-a');
        expect(html).not.toContain('pet-b');
        expect(html).not.toMatch(/<button|scheduled-days-grid|scheduled-days-navigation/);
        expect(records).toEqual(before);
    });
    it('preserves the valid Creche filter without creating days without reservations', () => {
        const html = render([
            { id: 'invalid', petId: 'pet', date: '2027-01-25', service: 'Creche', valid: false },
            { id: 'hotel', petId: 'pet', date: '2027-01-26', service: 'Hotel', valid: true },
            { id: 'bad-date', petId: 'pet', date: '2027-02-31', service: 'Creche', valid: true },
        ]);
        expect(html).toContain('Nenhum dia agendado.');
        expect(html).not.toContain('scheduled-day-card');
    });
    it('preserves loading, error, empty and illustrative states', () => {
        expect(render(null)).toContain('Carregando agendamentos…');
        expect(render(null, 'Falha de consulta')).toContain('Agenda indisponível. Falha de consulta');
        expect(render([])).toContain('Nenhum dia agendado.');
        expect(render([], '', true)).toContain('aria-label="Dias agendados — dados ilustrativos de desenvolvimento"');
    });
});
