import { requestJson } from './http';
import { list, nonnegative, object, positiveId, text } from '../models/integration-contracts';
export function createDashboardApi(baseUrl, request) {
    return {
        /** Aggregates stay aggregates: never synthesize individual pets, contracts or receipts. */
        async summary(signal) {
            const raw = object(await requestJson(baseUrl, '/dashboard', {}, signal, request), 'dashboard');
            const receitas = list(raw.kpiReceitas, 'receitas').map(value => {
                const r = object(value, 'receita');
                return { categoria: text(r.categoria, 'categoria'), acumuladoMes: nonnegative(r.acumuladoMes, 'receita'), meta: nonnegative(r.meta, 'meta'), percentualMeta: nonnegative(r.percentualMeta, 'percentual') };
            });
            const planos = object(raw.planosAtivos, 'planos ativos');
            return { kpiReceitas: receitas, planosAtivos: nonnegative(planos.planosAtivos, 'planos ativos'), agendamentosPorServico: list(raw.agendamentosPorServico, 'agendamentos').map(value => { const x = object(value, 'agendamento'); return { servico: text(x.servico, 'serviço'), quantidadeAgendada: nonnegative(x.quantidadeAgendada, 'quantidade') }; }), graficoReceita: list(raw.graficoReceita, 'gráfico de receitas').map(value => object(value, 'mês')), graficoNovosServicos: list(raw.graficoNovosServicos, 'novos serviços').map(value => object(value, 'mês')), graficoContratosPorServico: list(raw.graficoContratosPorServico, 'contratos').map(value => object(value, 'categoria')), ultimasMovimentacoes: list(raw.ultimasMovimentacoes, 'movimentações').map(value => object(value, 'movimentação')) };
        },
        async services(signal) {
            return list(await requestJson(baseUrl, '/dashboard/servicos', {}, signal, request), 'serviços').map(raw => { const v = object(raw, 'serviço'); return { ...v, idServico: positiveId(v.idServico, 'serviço') }; });
        },
        async pendingMovements(signal) {
            return list(await requestJson(baseUrl, '/dashboard/movimentacoes', {}, signal, request), 'pendências').map(raw => { const m = object(raw, 'pendência'); return { ...m, id: positiveId(m.id, 'movimentação'), idContrato: positiveId(m.idContrato, 'contrato') }; });
        },
        /** DASH-05: caller provides an approved exact LocalDate, not a fabricated YearMonth conversion. */
        async goals(referenceDate, serviceId, signal) {
            positiveId(serviceId, 'serviço');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(referenceDate))
                throw new Error('Data inválida');
            return list(await requestJson(baseUrl, '/dashboard/metas', { query: { mesReferencia: referenceDate, servico: serviceId } }, signal, request), 'metas').map(raw => { const m = object(raw, 'meta'); return { ...m, idMeta: positiveId(m.idMeta, 'meta') }; });
        },
    };
}
