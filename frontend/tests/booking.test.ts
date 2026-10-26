import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bookingDate, formatBookingDates, selectionForService, toggleBookingDate, validBookingSelection, recurringBookingDates, toggleCrecheWeekday, weekdaysForDates } from '../src/design/booking';
import type { DesignScreen } from '../src/design/types';

const design: DesignScreen = JSON.parse(readFileSync('src/design/TL03.json', 'utf8'));

describe('Seleção de datas por serviço', () => {
  for (const service of ['Hotel', 'DayUse']) {
    it(`permite adicionar e retirar múltiplos dias em ${service}`, () => {
      let dates = toggleBookingDate(['2026-08-13'], '2026-08-14', service);
      dates = toggleBookingDate(dates, '2026-08-15', service);
      expect(dates).toEqual(['2026-08-13', '2026-08-14', '2026-08-15']);
      expect(validBookingSelection(design.desktop, dates, service)).toBe(true);
      expect(toggleBookingDate(dates, '2026-08-14', service)).toEqual(['2026-08-13', '2026-08-15']);
    });
  }
  it('DayUse mantém múltiplas datas ao trocar o serviço e evita duplicação', () => {
    expect(selectionForService(['2026-08-13', '2026-08-15', '2026-08-13'], 'DayUse')).toEqual(['2026-08-13', '2026-08-15']);
    expect(toggleBookingDate(['2026-08-15'], '2026-08-16', 'DayUse')).toEqual(['2026-08-15', '2026-08-16']);
    expect(toggleBookingDate(['2026-08-16'], '2026-08-16', 'DayUse')).toEqual([]);
  });
  it('não confirma seleção vazia, inválida ou indisponível', () => {
    for (const service of ['Creche', 'Hotel', 'DayUse']) {
      for (const dates of [[], ['2026-08-01'], ['2026-08-13', '2026-08-08'], ['2026-02-31']]) {
        expect(validBookingSelection(design.desktop, dates, service)).toBe(false);
      }
    }
    expect(validBookingSelection(design.desktop, ['2026-08-13', '2026-08-14'], 'DayUse')).toBe(true);
  });
  it('preserva mês e ano e apresenta datas em ordem cronológica', () => {
    expect(bookingDate(14, 1)).toBe('2026-09-14');
    expect(bookingDate(14, 5)).toBe('2027-01-14');
    expect(formatBookingDates(['2026-08-15', '2026-08-13'])).toBe('13 de agosto · 15 de agosto');
  });
  it('Creche seleciona ocorrências mensais e exclui dias indisponíveis', () => {
    expect(recurringBookingDates(design.desktop, [2], 0)).toEqual(['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25']);
    expect(recurringBookingDates(design.desktop, [4], 0)).toEqual(['2026-08-13', '2026-08-20', '2026-08-27']);
    const weekdays = toggleCrecheWeekday([2, 4], 2);
    expect(weekdays).toEqual([4]);
    expect(recurringBookingDates(design.desktop, weekdays, 0)).not.toContain('2026-08-04');
    expect(recurringBookingDates(design.desktop, [2], 1)).toEqual(['2026-09-15', '2026-09-22', '2026-09-29']);
    expect(weekdaysForDates(['2026-08-04', '2026-08-11', '2026-09-15'], 0)).toEqual([2]);
  });
  it('Creche permite no máximo seis dias da semana diferentes', () => {
    expect(toggleCrecheWeekday([1, 2, 3, 4, 5, 6], 0)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(toggleCrecheWeekday([1, 2, 3, 4, 5, 6], 2)).toEqual([1, 3, 4, 5, 6]);
    expect(recurringBookingDates(design.desktop, [0, 1, 2, 3, 4, 5, 6], 0)).toEqual([]);
  });
  it('bloqueia domingos somente na Creche, inclusive ao converter ou validar seleções', () => {
    expect(toggleCrecheWeekday([], 0)).toEqual([]);
    expect(recurringBookingDates(design.desktop, [0], 0)).toEqual([]);
    expect(weekdaysForDates(['2026-08-09', '2026-08-13'], 0)).toEqual([4]);
    expect(validBookingSelection(design.desktop, ['2026-08-09'], 'Creche')).toBe(false);
    expect(validBookingSelection(design.desktop, ['2026-08-09'], 'Hotel')).toBe(true);
    expect(validBookingSelection(design.desktop, ['2026-08-09'], 'DayUse')).toBe(true);
  });
});
