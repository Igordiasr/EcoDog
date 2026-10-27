import { content, nodes } from './types';
export function calendarDay(node) {
    const number = nodes(node).find(child => child.name === 'Número do dia');
    if (!number)
        return;
    const day = Number.parseInt(content(number), 10);
    if (!Number.isInteger(day) || day < 1 || day > 31)
        return;
    return { day, unavailable: false };
}
// Legacy visual helper: does not determine API availability.
export function availableCalendarDay(root, day) {
    if (!root)
        return false;
    const entry = calendarDay(root);
    if (entry?.day === day)
        return true;
    return nodes(root).some(child => availableCalendarDay(child, day));
}
export function calendarForMonth(root, monthOffset) {
    const children = nodes(root);
    const rows = children.filter(child => child.name === 'Semana');
    if (!rows.length)
        return root;
    const cells = rows.flatMap(nodes);
    const template = cells.find(cell => calendarDay(cell));
    if (!template)
        return root;
    const empty = cells.find(cell => !calendarDay(cell));
    if (!empty)
        return root;
    const month = new Date(2026, 7 + monthOffset, 1);
    const firstWeekday = month.getDay();
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const rowCount = Math.ceil((firstWeekday + lastDay) / 7);
    const weeks = Array.from({ length: rowCount }, (_, week) => ({
        ...rows[0], id: `${root.id}-week-${week}`,
        children: Array.from({ length: 7 }, (_, column) => {
            const day = week * 7 + column - firstWeekday + 1;
            return day >= 1 && day <= lastDay ? { ...template, id: `${root.id}-day-${day}`, children: template.children?.map(child => typeof child === 'string' ? child : child.name === 'Número do dia' ? { ...child, id: `${root.id}-number-${day}`, children: [String(day)] } : child), className: (template.className || '').replace(/bg-\[#ffe8e0(?:ff)?\]/gi, '') } : { ...empty, id: `${root.id}-empty-${week}-${column}` };
        }),
    }));
    let inserted = false;
    return { ...root, children: root.children?.flatMap(child => {
            if (typeof child !== 'string' && child.name === 'Semana') {
                if (inserted)
                    return [];
                inserted = true;
                return weeks;
            }
            return [child];
        }) };
}
