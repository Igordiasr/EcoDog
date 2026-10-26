import { dateKey } from './dashboard-model';
import { monthDates, type CalendarData } from './calendar-model';

// Development-only sample data; never used on authenticated production routes.
export function calendarExamples(period: string, now = new Date()): CalendarData {
  const dates = monthDates(period), today = dateKey(now);
  const selected = dates.includes(today) ? today : dates[0];
  return {
    days: dates.map(date => ({ date, available: !date.endsWith('-03'), capacity: { Creche: 10, Hotel: 5 } })),
    activities: [{ id: `mock-activity-${period}`, date: selected, name: 'Brincadeiras (mock)', start: '09:00', end: '10:00' }],
    bookings: [{ id: `mock-booking-${period}`, date: selected, service: 'Creche', petId: 'mock-pet', petName: 'Pet de exemplo', breed: 'SRD (mock)', tutor: 'Tutor de exemplo', status: 'confirmed' }],
  };
}
