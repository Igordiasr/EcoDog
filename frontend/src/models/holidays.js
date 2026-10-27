export const unconfiguredHolidayCalendar = {
    configured: false,
    isHoliday: () => false,
    isCommemorativeDate: () => false,
};
// Future backend connection: pass its ISO date lists here and inject the
// resulting calendar through App.holidayCalendar. No external API is called.
export function createHolidayCalendar(data) {
    const holidays = new Set(data.holidays);
    const commemorativeDates = new Set(data.commemorativeDates || []);
    return {
        configured: true,
        isHoliday: date => holidays.has(date),
        isCommemorativeDate: date => commemorativeDates.has(date),
    };
}
export function isHoliday(date, calendar = unconfiguredHolidayCalendar) {
    return calendar.configured && calendar.isHoliday(date);
}
export function isCommemorativeDate(date, calendar = unconfiguredHolidayCalendar) {
    return calendar.configured && calendar.isCommemorativeDate(date);
}
