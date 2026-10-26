import { beforeEach, expect, it } from 'vitest';
import { bookingDraftKey, bookingDraftLifetime, clearBookingDraft, markBookingDraftReady, readBookingDraft, saveBookingDraft } from '../src/services/booking-draft';

const entries = new Map<string, string>();
const storage = { getItem: (key: string) => entries.get(key) || null, setItem: (key: string, value: string) => { entries.set(key, value); }, removeItem: (key: string) => { entries.delete(key); } };
beforeEach(() => { clearBookingDraft(undefined, storage); entries.clear(); });

it('preserva serviço, datas e frequência através do login sem consumir antecipadamente', () => {
  const draft = saveBookingDraft({ service: 'Creche', dates: ['2026-08-04', '2026-08-11'], weekdays: [2], monthOffset: 0 }, false, 1000, storage);
  expect(readBookingDraft(1100, storage)).toEqual(draft);
  const ready = markBookingDraftReady(1200, storage)!;
  expect(ready.phase).toBe('ready');
  expect(ready.weekdays).toEqual([2]);
  expect(ready.dates).toEqual(draft.dates);
  expect(readBookingDraft(1300, storage)).toEqual(ready);
  clearBookingDraft(ready.token, storage);
  expect(readBookingDraft(1400, storage)).toBeNull();
});
it('trata ausência de datas como seleção vazia válida', () => {
  saveBookingDraft({ service: 'Hotel', dates: [], weekdays: [], monthOffset: 1 }, false, 1000, storage);
  expect(markBookingDraftReady(1100, storage)?.dates).toEqual([]);
});
it('descarta dados expirados ou malformados e não apaga um fluxo mais recente', () => {
  const old = saveBookingDraft({ service: 'Hotel', dates: [], weekdays: [], monthOffset: 0 }, false, 1000, storage);
  const current = saveBookingDraft({ service: 'DayUse', dates: ['2026-09-14'], weekdays: [], monthOffset: 1 }, false, 1100, storage);
  clearBookingDraft(old.token, storage);
  expect(readBookingDraft(1200, storage)?.token).toBe(current.token);
  expect(readBookingDraft(1100 + bookingDraftLifetime, storage)).toBeNull();
  storage.setItem(bookingDraftKey, '{invalid');
  expect(readBookingDraft(1200, storage)).toBeNull();
  expect(storage.getItem(bookingDraftKey)).toBeNull();
});
it('mantém o fluxo SPA se o navegador não permitir escrita no sessionStorage', () => {
  saveBookingDraft({ service: 'Hotel', dates: ['2026-08-13'], weekdays: [], monthOffset: 0 }, false, 900, storage);
  const blocked = { ...storage, setItem: () => { throw new Error('Storage unavailable'); } };
  saveBookingDraft({ service: 'Hotel', dates: ['2026-08-14'], weekdays: [], monthOffset: 0 }, false, 1000, blocked);
  expect(markBookingDraftReady(1100, blocked)?.dates).toEqual(['2026-08-14']);
  const ready = readBookingDraft(1200, blocked)!;
  clearBookingDraft(ready.token, blocked);
  expect(readBookingDraft(1300, storage)).toBeNull();
});
