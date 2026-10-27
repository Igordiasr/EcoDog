import { describe, it, expect } from 'vitest';
import { dashboardSummary, goalAchievement, emptyDashboardData, parseMoney, recentPeriods } from '../src/models/dashboard-model';
import { dashboardExamples } from '../src/models/dashboard-examples';
import { validateDashboardForm } from '../src/models/dashboard-validation';
const now = new Date(2026, 9, 25);
describe('Dashboard business rules', () => {
    it.each([[180000, 200000, 90, '▼'], [200000, 200000, 100, ''], [210000, 200000, 105, '▲']])('computes achievement for %s / %s', (received, goal, percentage, arrow) => {
        expect(goalAchievement(received, goal)).toMatchObject({ percentage, arrow });
    });
    it('does not divide by missing, zero or invalid goals', () => {
        for (const goal of [undefined, 0, -1, NaN])
            expect(goalAchievement(100, goal)).toEqual({ percentage: null, arrow: '', progress: 0 });
    });
    it('deduplicates and excludes inactive/pending from active totals and pending from effective new contracts', () => {
        const data = emptyDashboardData();
        data.contracts = [{ id: '1', status: 'active', createdOn: '2026-10-01', service: 'Creche' }, { id: '1', status: 'active', createdOn: '2026-10-01', service: 'Creche' }, { id: '2', status: 'inactive', createdOn: '2026-10-02', service: 'Hotel' }, { id: '3', status: 'pending', createdOn: '2026-10-03', service: 'DayUse' }];
        const view = dashboardSummary(data, now);
        expect(view.activeContracts).toBe(1);
        expect(view.contractSeries.at(-1)?.counts).toEqual([1, 1, 0]);
    });
    it('counts valid pets once per service and date', () => {
        const data = emptyDashboardData();
        data.reservations = [{ id: '1', petId: 'pet', date: '2026-10-25', service: 'Creche', valid: true }, { id: '2', petId: 'pet', date: '2026-10-25', service: 'Creche', valid: true }, { id: '3', petId: 'other', date: '2026-10-25', service: 'Creche', valid: false }, { id: '4', petId: 'yesterday', date: '2026-10-24', service: 'Creche', valid: true }];
        expect(dashboardSummary(data, now).occupancy[0].count).toBe(1);
    });
    it('builds chronological 12/6 month windows including year rollover and missing data', () => {
        expect(recentPeriods(12, now)).toHaveLength(12);
        const view = dashboardSummary(emptyDashboardData(), now);
        expect(view.revenueSeries[0]).toEqual({ period: '2025-11', forecast: null, received: null });
        expect(view.revenueSeries.at(-1)?.period).toBe('2026-10');
        expect(view.contractSeries).toHaveLength(6);
    });
    it('keeps distribution exclusive and reports ambiguous active pets explicitly', () => {
        const data = dashboardExamples(now);
        expect(dashboardSummary(data, now).distribution).toEqual({ counts: [20, 10, 7, 7], total: 44, unclassified: [] });
        data.pets[0].services = ['Creche', 'Hotel'];
        expect(dashboardSummary(data, now).distribution).toMatchObject({ total: 43, unclassified: [data.pets[0].id] });
        data.pets[0].classification = 'Hotel';
        expect(dashboardSummary(data, now).distribution).toMatchObject({ counts: [19, 11, 7, 7], total: 44, unclassified: [] });
    });
    it('orders movements by full date and eliminates duplicate revenue IDs', () => {
        const data = dashboardExamples(now);
        data.revenues = [{ ...data.revenues[0], id: 'a', date: '2025-12-31' }, { ...data.revenues[0], id: 'b', date: '2026-01-01' }, { ...data.revenues[0], id: 'b', date: '2026-01-01' }];
        expect(dashboardSummary(data, now).movements.map(row => row.id)).toEqual(['b', 'a']);
    });
    it('uses available hours and seconds to sort movements without limiting calculation input', () => {
        const data = dashboardExamples(now), template = data.revenues[0];
        data.revenues = [{ ...template, id: 'a', date: '2026-10-25', time: '09:00' }, { ...template, id: 'b', date: '2026-10-25', time: '18:30:45' }, { ...template, id: 'c', date: '2026-10-25', time: '18:30:10' }, { ...template, id: 'd', date: '2026-10-26' }];
        expect(dashboardSummary(data, now).movements.map(row => row.id)).toEqual(['d', 'b', 'c', 'a']);
    });
    it.each(['', '-1', '1e5', 'abc', '1,2,3', '1.234,567'])('rejects malformed monetary input: %s', value => expect(parseMoney(value)).toBeNull());
    it('validates existing goals and refuses creating a duplicate or editing an absent goal', () => {
        const data = dashboardExamples(now);
        expect(validateDashboardForm('editGoal', { 'mes-cadastrado': '2026-10', servico: 'Creche', valor: 'R$ 0,00' }, data)).toEqual({});
        expect(validateDashboardForm('editGoal', { 'mes-cadastrado': '2030-10', servico: 'Creche', valor: '100' }, data)).toHaveProperty('mes-cadastrado');
        expect(validateDashboardForm('createGoal', { mes: '10', ano: '2026', servico: 'Creche', valor: '100' }, data)).toHaveProperty('servico');
    });
    it('requires a related client/pet, valid date and nonnegative value, without prohibiting future dates', () => {
        const data = dashboardExamples(now), values = { cliente: data.clients[0].id, pet: data.pets[0].id, servico: 'Hotel', data: '01/01/2099', valor: 'R$ 1.234,56' };
        expect(validateDashboardForm('revenue', values, data)).toEqual({});
        expect(validateDashboardForm('revenue', { ...values, cliente: data.clients[1].id, data: '31/02/2026', valor: '-1' }, data)).toHaveProperty('pet');
        expect(validateDashboardForm('revenue', { ...values, data: '01/01/12026' }, data)).toHaveProperty('data', 'Data inválida');
    });
});
