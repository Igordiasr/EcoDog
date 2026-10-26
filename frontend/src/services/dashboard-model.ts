// Normalized FRONTEND presentation model, not an HTTP response or API contract.
// A future adapter must map confirmed backend entities/IDs into this model.
export const dashboardServices = ['Creche', 'Hotel', 'DayUse'] as const;
export type DashboardService = typeof dashboardServices[number];
export interface DashboardGoal { id: string; period: string; service: DashboardService; cents: number }
export interface DashboardClient { id: string; name: string }
export interface DashboardPet { id: string; name: string; clientId: string; active: boolean; services: DashboardService[]; classification?: DashboardService }
export interface DashboardContract { id: string; service: DashboardService; status: 'active' | 'inactive' | 'pending'; createdOn: string }
export interface DashboardReservation { id: string; petId: string; service: DashboardService; date: string; valid: boolean }
export interface DashboardRevenue { id: string; clientId: string; petId: string; service: DashboardService; date: string; time?: string; cents: number }
export interface DashboardData {
  goals: DashboardGoal[]; clients: DashboardClient[]; pets: DashboardPet[];
  contracts: DashboardContract[]; reservations: DashboardReservation[]; revenues: DashboardRevenue[];
  forecasts: { period: string; cents: number }[];
  capacities: { date: string; service: DashboardService; total: number }[];
}
export interface DashboardSource { load(signal?: AbortSignal): Promise<DashboardData> }
export const emptyDashboardData = (): DashboardData => ({ goals: [], clients: [], pets: [], contracts: [], reservations: [], revenues: [], forecasts: [], capacities: [] });
export function dateKey(now: Date) { return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }
export function validISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validPeriod(value: string) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && !value.startsWith('0000'); }
export function periodLabel(period: string) {
  const [year, month] = period.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}
export function recentPeriods(count: number, now: Date) {
  return Array.from({ length: count }, (_, index) => dateKey(new Date(now.getFullYear(), now.getMonth() - count + index + 1, 1)).slice(0, 7));
}
export const moneyBRL = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export function parseMoney(value: string): number | null {
  const raw = value.trim().replace(/^R\$\s*/, '').trim();
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(raw) && !/^\d+\.\d{2}$/.test(raw)) return null;
  const normalized = raw.includes(',') || /\.\d{3}(?:\.|$)/.test(raw) ? raw.replaceAll('.', '').replace(',', '.') : raw;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}
const validCents = (cents: number) => Number.isSafeInteger(cents) && cents >= 0;
export function goalAchievement(received: number, goal?: number) {
  if (!validCents(received) || goal === undefined || !validCents(goal) || goal === 0) return { percentage: null, arrow: '', progress: 0 };
  const percentage = received / goal * 100;
  return { percentage, arrow: received === goal ? '' : received > goal ? '▲' : '▼', progress: Math.min(100, percentage) };
}
export function uniqueById<T extends { id: string }>(rows: T[]) { return [...new Map(rows.map(row => [row.id, row])).values()]; }
// Pending contracts are not considered effective. Confirm this mapping in the
// future backend adapter; inactive contracts still count in their creation month.
export const effectiveContract = (contract: DashboardContract) => contract.status !== 'pending';
export function dashboardSummary(data: DashboardData, now = new Date()) {
  const today = dateKey(now), period = today.slice(0, 7);
  const revenues = uniqueById(data.revenues).filter(row => validISODate(row.date) && validCents(row.cents));
  const contracts = uniqueById(data.contracts);
  const monthly = dashboardServices.map(service => {
    const received = revenues.filter(row => row.service === service && row.date.slice(0, 7) === period).reduce((sum, row) => sum + row.cents, 0);
    const goals = data.goals.filter(goal => goal.service === service && goal.period === period);
    const goal = goals.length === 1 && validCents(goals[0].cents) ? goals[0].cents : undefined;
    return { service, received, goal, ...goalAchievement(received, goal) };
  });
  const occupancy = dashboardServices.map(service => {
    const count = new Set(uniqueById(data.reservations).filter(row => row.valid && row.date === today && row.service === service).map(row => row.petId)).size;
    const capacity = data.capacities.find(row => row.date === today && row.service === service)?.total;
    return { service, count, capacity: capacity !== undefined && Number.isInteger(capacity) && capacity >= 0 ? capacity : undefined };
  });
  const revenueSeries = recentPeriods(12, now).map(period => {
    const forecasts = data.forecasts.filter(row => row.period === period && validCents(row.cents));
    const received = revenues.filter(row => row.date.slice(0, 7) === period);
    return { period, forecast: forecasts.length ? forecasts.reduce((sum, row) => sum + row.cents, 0) : null, received: received.length ? received.reduce((sum, row) => sum + row.cents, 0) : null };
  });
  const contractSeries = recentPeriods(6, now).map(period => ({ period, counts: dashboardServices.map(service => contracts.filter(row => effectiveContract(row) && row.service === service && validISODate(row.createdOn) && row.createdOn.slice(0, 7) === period).length) }));
  const counts = [0, 0, 0, 0];
  const unclassified: string[] = [];
  for (const pet of uniqueById(data.pets)) {
    if (!pet.active) { counts[3]++; continue; }
    const services = [...new Set(pet.services)];
    const classification = pet.classification && services.includes(pet.classification) ? pet.classification : services.length === 1 ? services[0] : undefined;
    if (classification && dashboardServices.includes(classification)) counts[dashboardServices.indexOf(classification)]++;
    else unclassified.push(pet.id);
  }
  const validTime = (time?: string) => !!time && /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time);
  return { monthly, occupancy, activeContracts: contracts.filter(row => row.status === 'active').length, revenueSeries, contractSeries, distribution: { counts, total: counts.reduce((a, b) => a + b, 0), unclassified }, movements: revenues.sort((a, b) => b.date.localeCompare(a.date) || (validTime(b.time) ? b.time!.padEnd(8, ':00') : '').localeCompare(validTime(a.time) ? a.time!.padEnd(8, ':00') : '') || b.id.localeCompare(a.id)) };
}
