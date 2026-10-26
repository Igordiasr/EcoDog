import { isHoliday, isCommemorativeDate, unconfiguredHolidayCalendar, type HolidayCalendar } from './holidays';

export const monthlyCrechePrices = [0, 36000, 63000, 78000, 96000, 109000, 120000] as const;

export interface DailyCartItem {
  id: string;
  kind: 'daily';
  service: 'Hotel' | 'DayUse';
  date: string;
  unitPriceCents: number;
  petCount: number;
  priceCents: number;
}
export interface MonthlyCartItem {
  id: string;
  kind: 'monthly';
  service: 'Creche';
  month: string;
  frequency: number;
  unitPriceCents: number;
  petCount: number;
  priceCents: number;
}
export interface BookingCart {
  items: Array<DailyCartItem | MonthlyCartItem>;
  petCount: number;
  subtotalPerPetCents: number;
  totalCents: number;
}

export function buildBookingCart({ service, dates, frequency = 0, month, petCount = 1, holidays = unconfiguredHolidayCalendar }: {
  service: string; dates: readonly string[]; frequency?: number; month: string; petCount?: number; holidays?: HolidayCalendar;
}): BookingCart {
  const quantity = Number.isInteger(petCount) && petCount >= 0 ? petCount : 0;
  let items: BookingCart['items'] = [];
  if (service === 'Creche') {
    if (Number.isInteger(frequency) && frequency >= 1 && frequency <= 6) {
      const unitPriceCents = monthlyCrechePrices[frequency];
      items = [{ id: `Creche:${month}`, kind: 'monthly', service: 'Creche', month, frequency, unitPriceCents, petCount: quantity, priceCents: unitPriceCents * quantity }];
    }
  } else if (service === 'Hotel' || service === 'DayUse') {
    items = [...new Set(dates)].sort().map(date => {
      const unitPriceCents = service === 'Hotel'
        ? isHoliday(date, holidays) || isCommemorativeDate(date, holidays) ? 15000 : 12000
        : isHoliday(date, holidays) ? 10000 : 9000;
      return { id: `${service}:${date}`, kind: 'daily', service, date, unitPriceCents, petCount: quantity, priceCents: unitPriceCents * quantity };
    });
  }
  // Apply holiday/monthly rates per pet first, then multiply in integer cents.
  return {
    items, petCount: quantity,
    subtotalPerPetCents: items.reduce((total, item) => total + item.unitPriceCents, 0),
    totalCents: items.reduce((total, item) => total + item.priceCents, 0),
  };
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
