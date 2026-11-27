import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import design from '../src/views/design/TL14.json';
import { managementCalendarDesign } from '../src/views/design/management-calendar';
import { ManagementStudent } from '../src/views/components/ManagementCalendar';
import { canCancelStudentBooking, validateCalendarCommand } from '../src/models/calendar-model';

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
        expect(markup).toContain('Entrada registrada');
        expect(markup).toContain('disabled');
        expect(markup).not.toContain('hh:mm');
    });

    it('permite cancelar apenas antes da entrada e valida a data do agendamento', () => {
        expect(canCancelStudentBooking({ status: 'PENDENTE' })).toBe(true);
        expect(canCancelStudentBooking({ status: 'AGENDADO' })).toBe(true);
        for (const status of ['CONFIRMADO', 'RETIRADO', 'CANCELADO', null]) expect(canCancelStudentBooking({ status })).toBe(false);
        const data = { students: [{ ...student, status: 'AGENDADO' }], bookings: [], activities: [] };
        expect(validateCalendarCommand({ kind: 'cancelBooking', id: student.id, date: student.date }, data)).toEqual([]);
        expect(validateCalendarCommand({ kind: 'cancelBooking', id: student.id, date: '2026-11-16' }, data)).not.toEqual([]);
        data.students[0].status = 'CONFIRMADO';
        expect(validateCalendarCommand({ kind: 'cancelBooking', id: student.id, date: student.date }, data)).not.toEqual([]);
    });

    it.each(['desktop', 'mobile'])('prioriza pendentes e mantém os demais registros em %s', (device) => {
        const section = find(design[device], 'Aulunos agendados');
        const list = find(section, 'Lista de aulunos') || section.children.find(child => child.children?.some(item => item.name === 'Auluno agendado'));
        const data = { students: [{ ...student, id: '1', status: 'AGENDADO' }, { ...student, id: '2', status: 'PENDENTE' }, { ...student, id: '3', status: 'PENDENTE' }, { ...student, id: '4', date: '2026-11-16', status: 'PENDENTE' }], bookings: [], activities: [] };
        const result = managementCalendarDesign(list, { selectedDate: student.date, data, example: false });
        const groups = find(result, 'Management list').children;
        expect(groups.map(group => group.name)).toEqual(['Aulunos a confirmar', 'Demais aulunos']);
        expect(groups[0].children.filter(child => child.name === 'Management student').map(child => child.id)).toEqual(['2', '3']);
        expect(groups[1].children.filter(child => child.name === 'Management student').map(child => child.id)).toEqual(['1']);
        expect(data.students.map(row => row.id)).toEqual(['1', '2', '3', '4']);
    });

    it('distingue estadia pendente de entrada e não simula confirmação', () => {
        const markup = renderToStaticMarkup(createElement(ManagementStudent, { row: { ...student, status: 'PENDENTE' } }));
        expect(markup).toContain('Aguardando confirmação');
        expect(markup).toContain('Confirmar estadia');
        expect(markup).toContain('A confirmação de estadia ainda não está disponível.');
        expect(markup).toMatch(/<button[^>]*disabled[^>]*>Confirmar estadia<\/button>/);
    });

    it('mostra o estado vazio de pendências sem esconder aulunos agendados', () => {
        const section = find(design.mobile, 'Aulunos agendados');
        const list = find(section, 'Lista de aulunos') || section.children.find(child => child.children?.some(item => item.name === 'Auluno agendado'));
        const result = managementCalendarDesign(list, { selectedDate: student.date, data: { students: [student], bookings: [], activities: [] }, example: false });
        const groups = find(result, 'Management list').children;
        expect(JSON.stringify(groups[0])).toContain('Nenhum auluno aguardando confirmação.');
        expect(find(groups[1], 'Management student').id).toBe(student.id);
    });
});
