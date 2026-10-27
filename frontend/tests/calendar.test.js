import { describe, it, expect } from 'vitest';
import { applyCalendarCommand, emptyCalendarData, monthCells, monthDates, occupiedPlaces, parseCapacity, shiftCalendarMonth, timeRangeError, validateActivity, validateBookingRequest, validateCalendarCommand } from '../src/models/calendar-model';
describe('Management calendar rules', () => {
    it('positions weekdays, leap days and year boundaries correctly', () => {
        expect(monthDates('2024-02')).toHaveLength(29);
        expect(monthDates('2025-02')).toHaveLength(28);
        expect(monthDates('1900-02')).toHaveLength(28);
        expect(monthDates('2000-02')).toHaveLength(29);
        expect(monthCells('2026-10')[4]).toBe('2026-10-01');
        expect(shiftCalendarMonth('2026-01-31', 1)).toBe('2026-02-28');
        expect(shiftCalendarMonth('2026-01-31', -1)).toBe('2025-12-31');
    });
    it.each(['', '-1', '1.2', '1,2', 'abc', '1e3'])('rejects invalid quantities %s', value => expect(parseCapacity(value)).toBeNull());
    it('keeps capacity, availability and existing records independent', () => {
        const data = emptyCalendarData();
        data.days = [{ date: '2026-10-25', available: true, capacity: { Creche: 10, Hotel: 5 } }];
        data.bookings = [{ id: 'a', date: '2026-10-25', service: 'Creche', petId: 'p', petName: 'Bob', status: 'confirmed' }, { id: 'a', date: '2026-10-25', service: 'Creche', petId: 'p', petName: 'Bob', status: 'confirmed' }];
        expect(occupiedPlaces(data, '2026-10-25', 'Creche')).toBe(1);
        expect(validateCalendarCommand({ kind: 'capacity', date: '2026-10-25', service: 'Creche', quantity: 0 }, data)).toHaveLength(1);
        const next = applyCalendarCommand(data, { kind: 'capacity', date: '2026-10-25', service: 'Hotel', quantity: 0 });
        expect(next.days[0].capacity).toEqual({ Creche: 10, Hotel: 0 });
        const unavailable = applyCalendarCommand(next, { kind: 'availability', date: '2026-10-25', available: false });
        expect(unavailable.bookings).toEqual(data.bookings);
        expect(validateBookingRequest({ ...data.bookings[0], id: 'new', start: '10:00', end: '11:00' }, unavailable)).toContain('Esta data não está disponível para novos agendamentos.');
    });
    it('rejects an incompatible monthly operation before modifying any date', () => {
        const data = emptyCalendarData();
        data.bookings = [{ id: 'a', date: '2026-10-25', service: 'Creche', petId: 'p', petName: 'Bob', status: 'confirmed' }];
        const before = structuredClone(data);
        expect(() => applyCalendarCommand(data, { kind: 'monthCapacity', period: '2026-10', service: 'Creche', quantity: 0 })).toThrow('25/10/2026');
        expect(data).toEqual(before);
        const next = applyCalendarCommand(data, { kind: 'monthCapacity', period: '2026-10', service: 'Hotel', quantity: 3 });
        expect(next.days).toHaveLength(31);
        expect(next.bookings).toEqual(data.bookings);
        expect(next.activities).toEqual(data.activities);
        expect(next.days.every(day => day.capacity.Hotel === 3 && day.available === undefined)).toBe(true);
    });
    it('validates activity timing and only enforces concurrency when a policy supplies it', () => {
        expect(timeRangeError('11:00', '10:00')).toContain('anterior');
        expect(timeRangeError('24:00', '25:00')).toContain('válidos');
        const data = emptyCalendarData();
        data.activities = [{ id: 'a', date: '2026-10-25', name: 'A', start: '09:00', end: '10:00' }];
        const activity = { id: 'b', date: '2026-10-25', name: 'B', start: '09:30', end: '10:30' };
        expect(validateActivity(activity, data)).toEqual({});
        expect(validateActivity(activity, data, { activityConflict: () => true })).toHaveProperty('start');
        expect(validateActivity({ ...activity, name: '  ', end: '' }, data)).toHaveProperty('name');
    });
    it('cancels only the chosen booking and respects provided cancellation policy', () => {
        const data = emptyCalendarData();
        data.bookings = [{ id: 'a', date: '2026-10-25', service: 'Creche', petId: 'p', petName: 'Bob', tutor: 'Viviane', status: 'confirmed' }, { id: 'b', date: '2026-10-25', service: 'Hotel', petId: 'q', petName: 'Thor', status: 'confirmed' }];
        const command = { kind: 'cancelBooking', id: 'a', date: '2026-10-25' };
        expect(validateCalendarCommand(command, data, { cancellationError: () => 'Cancelamento não permitido.' })).toEqual(['Cancelamento não permitido.']);
        const next = applyCalendarCommand(data, command);
        expect(next.bookings[0]).toMatchObject({ status: 'cancelled', petId: 'p', tutor: 'Viviane' });
        expect(next.bookings[1].status).toBe('confirmed');
        expect(occupiedPlaces(next, '2026-10-25', 'Creche')).toBe(0);
    });
});
