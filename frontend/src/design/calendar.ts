import { content, nodes, type DesignNode } from './types';

export interface CalendarDay { day: number; unavailable: boolean }

export function calendarDay(node: DesignNode): CalendarDay | undefined {
  const number = nodes(node).find(child => child.name === 'Número do dia');
  if (!number) return;
  const day = Number.parseInt(content(number), 10);
  if (!Number.isInteger(day)) return;
   // Presentation-only blocked selection in the prototype, never real capacity.
  return { day, unavailable: /bg-\[#ffe8e0(?:ff)?\]/i.test(node.className) };
}

// Legacy name: this answers whether a prototype cell is selectable, not whether
// a reservation is available. Operational writes must not rely on this result.
export function availableCalendarDay(root: DesignNode | undefined, day: number): boolean {
  if (!root) return false;
  const entry = calendarDay(root);
  if (entry?.day === day) return !entry.unavailable;
  return nodes(root).some(child => availableCalendarDay(child, day));
}

export function calendarForMonth(root: DesignNode, monthOffset: number): DesignNode {
  const children = nodes(root);
  const rows = children.filter(child => child.name === 'Semana');
  if (!rows.length) return root;
  const cells = rows.flatMap(nodes);
  const byDay = new Map(cells.map(cell => [calendarDay(cell)?.day, cell]));
  const empty = cells.find(cell => !calendarDay(cell));
  if (!empty) return root;
  const month = new Date(2026, 7 + monthOffset, 1);
  const firstWeekday = month.getDay();
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const rowCount = Math.ceil((firstWeekday + lastDay) / 7);
  const weeks = Array.from({ length: rowCount }, (_, week) => ({
    ...rows[0], id: `${root.id}-week-${week}`,
    children: Array.from({ length: 7 }, (_, column) => {
      const day = week * 7 + column - firstWeekday + 1;
      return day >= 1 && day <= lastDay ? byDay.get(day)! : { ...empty, id: `${root.id}-empty-${week}-${column}` };
    }),
  }));
  let inserted = false;
  return { ...root, children: root.children?.flatMap(child => {
    if (typeof child !== 'string' && child.name === 'Semana') {
      if (inserted) return [];
      inserted = true; return weeks;
    }
    return [child];
  }) };
}
