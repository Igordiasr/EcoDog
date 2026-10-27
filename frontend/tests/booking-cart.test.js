import { describe, expect, it } from 'vitest';
import { buildBookingCart, monthlyCrechePrices } from '../src/viewmodels/booking-cart';
import { createHolidayCalendar, isHoliday, isCommemorativeDate, unconfiguredHolidayCalendar } from '../src/models/holidays';
const dates = ['2026-08-13', '2026-08-14', '2026-08-15'];
const holidays = createHolidayCalendar({ holidays: ['2026-08-13'], commemorativeDates: ['2026-08-15'] });
describe('Carrinho de agendamento e calendário de feriados', () => {
    it('não classifica feriados nem datas comemorativas sem dados configurados', () => {
        expect(isHoliday('2026-12-25')).toBe(false);
        expect(isCommemorativeDate('2026-12-25')).toBe(false);
        expect(isHoliday(dates[0], { ...unconfiguredHolidayCalendar, isHoliday: () => true })).toBe(false);
        expect(buildBookingCart({ service: 'Hotel', dates, month: '2026-08' }).totalCents).toBe(36000);
        expect(buildBookingCart({ service: 'DayUse', dates, month: '2026-08' }).totalCents).toBe(27000);
    });
    it('Hotel cobra 120 em dias normais e 150 em feriados e datas comemorativas', () => {
        const cart = buildBookingCart({ service: 'Hotel', dates: [...dates, dates[0]], month: '2026-08', holidays });
        expect(cart.items.map(item => item.priceCents)).toEqual([15000, 12000, 15000]);
        expect(cart.totalCents).toBe(42000);
        expect(cart.items).toHaveLength(3);
        expect(cart.items.every(item => item.kind === 'daily' && item.service === 'Hotel' && dates.includes(item.date))).toBe(true);
    });
    it('Day Use cobra 90 normalmente e 100 somente em feriados', () => {
        const cart = buildBookingCart({ service: 'DayUse', dates, month: '2026-08', holidays });
        expect(cart.items.map(item => item.priceCents)).toEqual([10000, 9000, 9000]);
        expect(cart.totalCents).toBe(28000);
        const removed = buildBookingCart({ service: 'DayUse', dates: dates.slice(1), month: '2026-08', holidays });
        expect(removed.totalCents).toBe(18000);
        expect(removed.items).toHaveLength(2);
        expect(buildBookingCart({ service: 'DayUse', dates: [], month: '2026-08', holidays }).totalCents).toBe(0);
    });
    for (const [frequency, price] of [[1, 36000], [2, 63000], [3, 78000], [4, 96000], [5, 109000], [6, 120000]]) {
        it(`Creche cobra uma única mensalidade de ${price / 100} para frequência ${frequency}`, () => {
            const cart = buildBookingCart({ service: 'Creche', dates: [...dates, ...dates], frequency, month: '2026-08', holidays });
            expect(cart.items).toEqual([{ id: 'Creche:2026-08', kind: 'monthly', service: 'Creche', month: '2026-08', frequency, unitPriceCents: price, petCount: 1, priceCents: price }]);
            expect(cart.totalCents).toBe(monthlyCrechePrices[frequency]);
        });
    }
    it('não cobra mensalidade para frequências inválidas ou vazias', () => {
        for (const frequency of [0, 7, -1, 1.5])
            expect(buildBookingCart({ service: 'Creche', dates, frequency, month: '2026-08' }).items).toEqual([]);
    });
    it('multiplica cada tarifa normal/especial pela quantidade atual de pets', () => {
        const hotel = buildBookingCart({ service: 'Hotel', dates, month: '2026-08', holidays, petCount: 3 });
        expect(hotel.items.map(item => item.unitPriceCents)).toEqual([15000, 12000, 15000]);
        expect(hotel.items.map(item => item.priceCents)).toEqual([45000, 36000, 45000]);
        expect(hotel.subtotalPerPetCents).toBe(42000);
        expect(hotel.totalCents).toBe(126000);
        const dayUse = buildBookingCart({ service: 'DayUse', dates, month: '2026-08', holidays, petCount: 2 });
        expect(dayUse.items.map(item => item.priceCents)).toEqual([20000, 18000, 18000]);
        expect(dayUse.subtotalPerPetCents).toBe(28000);
        expect(dayUse.totalCents).toBe(56000);
    });
    it('recalcula sem cobrar pets ou datas removidos', () => {
        for (const petCount of [3, 2, 1, 0]) {
            const cart = buildBookingCart({ service: 'Hotel', dates: dates.slice(1), month: '2026-08', holidays, petCount });
            expect(cart.petCount).toBe(petCount);
            expect(cart.subtotalPerPetCents).toBe(27000);
            expect(cart.totalCents).toBe(27000 * petCount);
            expect(cart.items.every(item => item.petCount === petCount)).toBe(true);
        }
    });
    it('multiplica a única mensalidade de Creche, sem cobrar as ocorrências individuais', () => {
        for (let frequency = 1; frequency <= 6; frequency++) {
            for (const petCount of [0, 1, 3]) {
                const cart = buildBookingCart({ service: 'Creche', dates, frequency, month: '2026-08', petCount });
                expect(cart.items).toHaveLength(1);
                expect(cart.subtotalPerPetCents).toBe(monthlyCrechePrices[frequency]);
                expect(cart.totalCents).toBe(monthlyCrechePrices[frequency] * petCount);
            }
        }
    });
});
