export function bookingDate(day, monthOffset) {
    const month = new Date(2026, 7 + monthOffset, 1);
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function selectionForService(dates, service) {
    return ['Creche', 'Hotel', 'DayUse'].includes(service) ? [...new Set(dates)] : [];
}
export function toggleBookingDate(dates, date, service) {
    if (dates.includes(date))
        return dates.filter(selected => selected !== date);
    return ['Hotel', 'DayUse', 'Creche'].includes(service) ? [...dates, date] : dates;
}
// Validates a UI draft only. Colours, dates and recurrence cannot authorize a
// reservation; identified pets and operational availability are still missing.
export function validBookingSelection(root, dates, service) {
    if (!['Creche', 'Hotel', 'DayUse'].includes(service) || !dates.length)
        return false;
    return new Set(dates).size === dates.length && dates.every(value => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
            return false;
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && (service !== 'Creche' || date.getDay() !== 0);
    });
}
export function bookingMonth(monthOffset) {
    return bookingDate(1, monthOffset).slice(0, 7);
}
export function weekdayForDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
}
export function weekdaysForDates(dates, monthOffset) {
    return [...new Set(dates.filter(date => date.startsWith(`${bookingMonth(monthOffset)}-`)).map(weekdayForDate))].filter(weekday => weekday !== 0);
}
export function toggleCrecheWeekday(weekdays, weekday) {
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 6)
        return weekdays;
    if (weekdays.includes(weekday))
        return weekdays.filter(value => value !== weekday);
    return weekdays.length < 6 ? [...weekdays, weekday] : weekdays;
}
export function recurringBookingDates(root, weekdays, monthOffset) {
    if (weekdays.length > 6 || weekdays.some(weekday => !Number.isInteger(weekday) || weekday < 1 || weekday > 6) || new Set(weekdays).size !== weekdays.length)
        return [];
    const month = new Date(2026, 7 + monthOffset, 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const dates = [];
    for (let day = 1; day <= lastDay; day++) {
        const value = bookingDate(day, monthOffset);
        // Recurrence never overrides a blocked date from the existing calendar.
        if (weekdays.includes(weekdayForDate(value)))
            dates.push(value);
    }
    return dates;
}
export function formatBookingDates(dates) {
    const formatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
    return [...dates].sort().map(value => {
        const [year, month, day] = value.split('-').map(Number);
        return formatter.format(new Date(year, month - 1, day));
    }).join(' · ');
}
