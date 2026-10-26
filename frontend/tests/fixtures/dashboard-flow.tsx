import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '../../src/App';
import { dashboardExamples } from '../../src/services/dashboard-examples';
import { emptyDashboardData, type DashboardSource, type DashboardService } from '../../src/services/dashboard-model';
import type { EcoDogApi } from '../../src/services/api';
import '../../src/styles.css';

// Explicit test-only adapters, never imported by the production application.
const params = new URLSearchParams(location.search);
let data = params.has('empty') ? emptyDashboardData() : dashboardExamples();
if (params.has('received')) data.revenues[0].cents = Number(params.get('received'));
if (params.has('ambiguous')) data.pets[0].services = ['Creche', 'Hotel'];
for (const goal of data.goals) if (goal.service === 'Creche' && goal.period !== new Date().toISOString().slice(0, 7)) goal.cents = goal.period.endsWith('-09') ? 150000 : 100000;
if (params.has('many')) for (let index = 0; index < 25; index++) data.revenues.push({ ...data.revenues[0], id: `fixture-extra-${index}`, date: '2026-10-24', cents: 100 });
if (data.contracts.length) data.contracts.push({ ...data.contracts[0] });
if (data.reservations.length) data.reservations.push({ ...data.reservations[0], id: 'duplicate-pet-reservation' });
const calls: unknown[] = [];
let sequence = 0;
const source: DashboardSource = { async load() {
  await new Promise(resolve => setTimeout(resolve, 40));
  if (params.has('loadFailure')) throw new Error('Falha de teste no carregamento.');
  return structuredClone(data);
} };
const api: EcoDogApi = {
  async session() { return { userId: 'fixture-admin', name: 'Admin de teste', profile: 'admin' }; },
  async login() { throw new Error('Login não utilizado por esta fixture.'); },
  async logout() {},
  async execute(operation, payload) {
    calls.push({ operation, payload });
    sessionStorage.setItem('fixture:dashboard-calls', JSON.stringify(calls));
    await new Promise(resolve => setTimeout(resolve, params.has('delay') ? 300 : 30));
    if (params.has('failure')) throw new Error('Falha de teste na gravação.');
    if (operation === 'saveGoal') {
      const cents = Math.round(Number(payload.valor) * 100);
      if (payload.target) {
        if (!data.goals.some(goal => goal.id === payload.target)) throw new Error('Meta inexistente.');
        data = { ...data, goals: data.goals.map(goal => goal.id === payload.target ? { ...goal, cents } : goal) };
      } else data = { ...data, goals: [...data.goals, { id: `fixture-goal-${sequence++}`, period: `${payload.ano}-${String(payload.mes).padStart(2, '0')}`, service: payload.servico as DashboardService, cents }] };
    } else if (operation === 'saveRevenue') data = { ...data, revenues: [...data.revenues, { id: `fixture-revenue-${sequence++}`, clientId: String(payload.cliente), petId: String(payload.pet), service: payload.servico as DashboardService, date: String(payload.data), cents: Math.round(Number(payload.valor) * 100) }] };
    else throw new Error('Operação inesperada na fixture.');
    return { message: 'Confirmado pelo adaptador de teste.' };
  },
};
history.replaceState(null, '', '/admin');
createRoot(document.getElementById('root')!).render(<BrowserRouter><App api={api} dashboardSource={source} /></BrowserRouter>);
