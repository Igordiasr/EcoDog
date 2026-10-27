import { createDashboardApi } from './dashboard-api';
import { dashboardServices, emptyDashboardData, validPeriod, validISODate } from '../models/dashboard-model';
import { nonnegative, text } from '../models/integration-contracts';
import { HttpError } from './http';

const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function period(value) {
    if (validPeriod(value)) return value;
    const [month, year] = String(value).toLowerCase().split('/');
    const index = months.indexOf(month);
    const result = `${year}-${String(index + 1).padStart(2, '0')}`;
    if (index < 0 || !validPeriod(result)) throw new Error('Mês inválido no dashboard.');
    return result;
}
const cents = value => {
    const result = Math.round(nonnegative(value, 'valor') * 100);
    if (!Number.isSafeInteger(result)) throw new Error('Valor inválido no dashboard.');
    return result;
};
const serviceKey = value => String(value).replace(/\s/g, '').toUpperCase();

/** Preserve server aggregates without inventing contracts, pets or receipts. */
export function dashboardData(raw) {
    const counts = [...dashboardServices, 'Inativos'].map(service => raw.graficoContratosPorServico.filter(row => serviceKey(row.categoria) === serviceKey(service)).reduce((sum, row) => sum + nonnegative(row.quantidade, 'contratos'), 0));
    return { ...emptyDashboardData(), summary: {
        monthly: dashboardServices.map(service => {
            const row = raw.kpiReceitas.find(row => serviceKey(row.categoria) === serviceKey(service));
            if (!row) throw new Error(`Indicador indisponível: ${service}.`);
            const percentage = row.meta > 0 ? row.percentualMeta : null;
            return { service, received: cents(row.acumuladoMes), goal: cents(row.meta), percentage, progress: Math.min(100, percentage ?? 0), arrow: percentage === null || percentage === 100 ? '' : percentage > 100 ? '▲' : '▼' };
        }),
        occupancy: dashboardServices.map(service => ({ service, count: raw.agendamentosPorServico.filter(row => serviceKey(row.servico) === serviceKey(service)).reduce((sum, row) => sum + row.quantidadeAgendada, 0), capacity: undefined })),
        activeContracts: raw.planosAtivos,
        revenueSeries: raw.graficoReceita.map(row => ({ period: period(row.mesReferencia), forecast: cents(row.receitaPrevista), received: cents(row.receitaRecebida) })),
        contractSeries: raw.graficoNovosServicos.map(row => ({ period: period(row.mesReferencia), counts: [row.creche, row.hotel, row.dayUse].map(value => nonnegative(value, 'novos contratos')) })),
        distribution: { counts, total: counts.reduce((sum, count) => sum + count, 0), unclassified: [], unit: 'contratos' },
        movements: raw.ultimasMovimentacoes.map((row, index) => {
            if (!validISODate(row.dataPagamento)) throw new Error('Data de pagamento inválida.');
            return { id: String(index), date: row.dataPagamento, service: text(row.servico, 'serviço'), petName: text(row.pet, 'pet'), cents: cents(row.valor) };
        }),
    } };
}

export function createDashboardSource(baseUrl, request, token, onSessionExpired) {
    const api = createDashboardApi(baseUrl, request, token);
    return { async load(signal) {
        try { return dashboardData(await api.summary(signal)); }
        catch (error) {
            if (error instanceof HttpError && error.status === 401) onSessionExpired?.();
            throw error;
        }
    },
    async services(signal) {
        return (await api.services(signal)).map(row => ({ id: String(row.idServico), name: `${row.nome} • ${row.categoria}${row.frequencia ? ` • ${row.frequencia}` : ''}`, category: row.categoria }));
    },
    async goals(referenceDate, service, signal) {
        return (await api.goals(referenceDate, service.category, signal)).filter(row => String(row.servico?.idServico) === service.id).map(row => ({ id: String(row.idMeta), period: row.mesReferencia, service: service.id, cents: cents(row.valor) }));
    },
    async saveGoal(referenceDate, serviceId, value, target) {
        await api.saveGoal({ mesReferencia: referenceDate, valor: value, servico: { idServico: Number(serviceId) } }, target);
        return { message: target ? 'Meta atualizada com sucesso.' : 'Meta cadastrada com sucesso.' };
    } };
}
export const dashboardSource = createDashboardSource(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
