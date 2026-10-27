import { dateKey } from './dashboard-model';
// Illustrative dates from the prototype, clearly marked as examples by the UI.
export function tutorScheduleExamples(now = new Date()) {
    const period = dateKey(now).slice(0, 7);
    return [5, 7, 12, 14].map(day => ({ id: `example-tutor-date-${day}`, petId: 'example-pet', service: 'Creche', date: `${period}-${String(day).padStart(2, '0')}`, valid: true }));
}
