export interface HolidayCalendarData {
  holidays: readonly string[];
  commemorativeDates?: readonly string[];
}

export interface HolidayCalendar {
  readonly configured: boolean;
  isHoliday(date: string): boolean;
  isCommemorativeDate(date: string): boolean;
}

export const unconfiguredHolidayCalendar: HolidayCalendar = {
  configured: false,
  isHoliday: () => false,
  isCommemorativeDate: () => false,
};

// Future backend connection: pass its ISO date lists here and inject the
// resulting calendar through App.holidayCalendar. No external API is called.
export function createHolidayCalendar(data: HolidayCalendarData): HolidayCalendar {
  const holidays = new Set(data.holidays);
  const commemorativeDates = new Set(data.commemorativeDates || []);
  return {
    configured: true,
    isHoliday: date => holidays.has(date),
    isCommemorativeDate: date => commemorativeDates.has(date),
  };
}

export function isHoliday(date: string, calendar: HolidayCalendar = unconfiguredHolidayCalendar): boolean {
  return calendar.configured && calendar.isHoliday(date);
}

export function isCommemorativeDate(date: string, calendar: HolidayCalendar = unconfiguredHolidayCalendar): boolean {
  return calendar.configured && calendar.isCommemorativeDate(date);
}
