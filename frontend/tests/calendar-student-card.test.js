import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import design from '../src/views/design/TL14.json';
import { managementCalendarDesign } from '../src/views/design/management-calendar';
import { ManagementStudent } from '../src/views/components/ManagementCalendar';

const find = (node, name) => node?.name === name ? node : node?.children?.filter(child => typeof child !== 'string').map(child => find(child, name)).find(Boolean);
const student = { id: '12', name: 'Mel', breed: 'Labrador', age: 1, tutor: 'Ana', date: '2026-11-15', status: 'CONFIRMADO' };

describe('aulunos no calendário', () => {
    it.each(['desktop', 'mobile'])('reaproveita o cartão e a patinha do protótipo em %s', (device) => {
        const section = find(design[device], 'Aulunos agendados');
        const list = find(section, 'Lista de aulunos') || section.children.find(child => child.children?.some(item => item.name === 'Auluno agendado'));
        expect(list).toBeTruthy();
        const template = find(list, 'Auluno agendado');
        const result = managementCalendarDesign(list, { selectedDate: student.date, data: { students: [student], bookings: [], activities: [] }, example: false });
        const card = find(result, 'Management student');
        expect(card.id).toBe(student.id);
        expect(find(card, 'Foto a preencher')).toEqual(find(template, 'Foto a preencher'));
    });

    it('mostra os dados disponíveis e não inventa horários ou ações', () => {
        const markup = renderToStaticMarkup(createElement(ManagementStudent, { row: student, photo: createElement('span', null, 'patinha') }));
        expect(markup).toContain('management-student-card');
        expect(markup).toContain('Mel');
        expect(markup).toContain('Labrador • 1 ano');
        expect(markup).toContain('Tutor: Ana');
        expect(markup).toContain('Horários não informados');
        expect(markup).toContain('Ver detalhes');
        expect(markup).toContain('Confirmado');
        expect(markup).toContain('disabled');
        expect(markup).not.toContain('hh:mm');
    });
});
