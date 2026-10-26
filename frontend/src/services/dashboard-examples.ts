import { dashboardServices, dateKey, emptyDashboardData, recentPeriods, type DashboardData } from './dashboard-model';

// Illustrative data only. Imported exclusively by the DEV prototype route.
export function dashboardExamples(now = new Date()): DashboardData {
  const data = emptyDashboardData();
  const today = dateKey(now), period = today.slice(0, 7);
  data.clients = [{ id: 'example-viviane', name: 'Viviane' }, { id: 'example-client', name: 'Cliente de exemplo' }];
  let petIndex = 0;
  [20, 10, 7, 7].forEach((count, category) => {
    for (let index = 0; index < count; index++) {
      const id = `example-pet-${petIndex}`;
      data.pets.push({ id, name: ['Thor', 'Mel', 'Luke', 'Bob'][petIndex] || `Pet de exemplo ${petIndex + 1}`, clientId: petIndex < 4 ? 'example-viviane' : 'example-client', active: category < 3, services: category < 3 ? [dashboardServices[category]] : [] });
      petIndex++;
    }
  });
  const goals = [200000, 600000, 600000];
  dashboardServices.forEach((service, index) => {
    for (const goalPeriod of [period, recentPeriods(2, now)[0], `${now.getFullYear() - 1}-${period.slice(5)}`]) data.goals.push({ id: `example-goal-${service}-${goalPeriod}`, period: goalPeriod, service, cents: goals[index] });
    data.revenues.push({ id: `example-revenue-${service}`, clientId: 'example-viviane', petId: data.pets[index].id, service, date: today, cents: [180000, 630000, 630000][index] });
    data.capacities.push({ date: today, service, total: 10 });
    for (let n = 0; n < [6, 3, 6][index]; n++) data.reservations.push({ id: `example-reservation-${service}-${n}`, petId: data.pets[index * 10 + n].id, service, date: today, valid: true });
  });
  recentPeriods(12, now).slice(0, -1).forEach((month, index) => {
    if (index < 7) return; // Unknown months deliberately remain missing, not invented zeroes.
    data.forecasts.push({ period: month, cents: [750000, 800000, 700000, 800000][index - 7] });
    data.revenues.push({ id: `example-history-${month}`, clientId: 'example-viviane', petId: data.pets[0].id, service: 'Hotel', date: `${month}-15`, cents: [800000, 700000, 680000, 820000][index - 7] });
  });
  data.forecasts.push({ period, cents: 1400000 });
  const periods = recentPeriods(6, now);
  const samples = [[0, 0, 1, 5, 5, 4], [0, 0, 0, 1, 7, 8], [0, 0, 1, 7, 3, 0]];
  let contractIndex = 0;
  dashboardServices.forEach((service, s) => periods.forEach((month, m) => {
    for (let n = 0; n < samples[s][m]; n++) data.contracts.push({ id: `example-contract-${contractIndex}`, service, status: contractIndex++ < 32 ? 'active' : 'inactive', createdOn: `${month}-01` });
  }));
  data.contracts.push({ id: 'example-pending', service: 'Creche', status: 'pending', createdOn: today });
  return data;
}
