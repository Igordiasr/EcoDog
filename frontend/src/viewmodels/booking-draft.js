import { validBookingSelection } from '../views/design/booking';
export const bookingDraftKey = 'ecodog:structure-booking:v1';
export const bookingDraftLifetime = 30 * 60 * 1000;
let memoryDraft = null;
let memoryOnly = false;
function browserStorage() {
    try {
        return typeof window === 'undefined' ? undefined : window.sessionStorage;
    }
    catch {
        return undefined;
    }
}
function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function validDraft(value, now) {
    if (!value || typeof value !== 'object')
        return false;
    const draft = value;
    return draft.version === 1 && typeof draft.token === 'string' && ['login', 'ready'].includes(draft.phase)
        && typeof draft.createdAt === 'number' && now >= draft.createdAt && now - draft.createdAt < bookingDraftLifetime
        && ['Creche', 'Hotel', 'DayUse'].includes(draft.service)
        && Array.isArray(draft.dates) && draft.dates.every(validDate) && new Set(draft.dates).size === draft.dates.length
        && Array.isArray(draft.weekdays) && draft.weekdays.length <= 6 && draft.weekdays.every(day => Number.isInteger(day) && day >= 1 && day <= 6) && new Set(draft.weekdays).size === draft.weekdays.length
        && Number.isSafeInteger(draft.monthOffset) && Number.isFinite(new Date(2026, 7 + draft.monthOffset, 1).getTime());
}
export function clearBookingDraft(token, storage = browserStorage()) {
    if (!token || memoryDraft?.token === token) {
        memoryDraft = null;
        memoryOnly = false;
    }
    try {
        const raw = storage?.getItem(bookingDraftKey);
        if (!token || raw && JSON.parse(raw).token === token)
            storage?.removeItem(bookingDraftKey);
    }
    catch { /* Storage may be disabled; the in-memory SPA fallback still works. */ }
}
export function readBookingDraft(now = Date.now(), storage = browserStorage()) {
    let value = memoryDraft;
    try {
        const raw = storage?.getItem(bookingDraftKey);
        if (storage && !memoryOnly)
            value = raw ? JSON.parse(raw) : null;
    }
    catch { /* Use SPA fallback. */ }
    if (!validDraft(value, now)) {
        clearBookingDraft(undefined, storage);
        return null;
    }
    return value;
}
export function saveBookingDraft(selection, ready = false, now = Date.now(), storage = browserStorage()) {
    const draft = { ...selection, dates: [...selection.dates], weekdays: [...selection.weekdays], version: 1, token: globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`, createdAt: now, phase: ready ? 'ready' : 'login' };
    memoryDraft = draft;
    memoryOnly = !storage;
    try {
        storage?.setItem(bookingDraftKey, JSON.stringify(draft));
    }
    catch {
        memoryOnly = true;
        // Do not let an older stored request reappear after this SPA flow finishes.
        try {
            storage?.removeItem(bookingDraftKey);
        }
        catch { /* Storage access is blocked. */ }
    }
    return draft;
}
export function markBookingDraftReady(now = Date.now(), storage = browserStorage()) {
    const draft = readBookingDraft(now, storage);
    if (!draft)
        return null;
    const ready = { ...draft, phase: 'ready' };
    memoryDraft = ready;
    try {
        storage?.setItem(bookingDraftKey, JSON.stringify(ready));
    }
    catch {
        memoryOnly = true;
    }
    return ready;
}
export function draftDatesForCalendar(draft, calendar) {
    // Empty is a valid handoff, not a request to restore the prototype's default date.
    return draft.dates.filter(date => validBookingSelection(calendar, [date], draft.service));
}
