import { requestJson } from './http';
import { list, nonnegative, object, positiveId, text } from '../models/integration-contracts';
export function createDashboardApi(baseUrl, request, token) {
    const send = (path, options, signal) => requestJson(baseUrl, path, { ...options, headers: token ? { Authorization: `Bearer ${token}` } : {} }, signal, request);
    return {
        /** Aggregates stay aggregates: never synthesize individual pets, contracts or receipts. */
        async summary(signal) {
            const raw = object(await send('/dashboard', {}, signal), 'dashboard');
            const receitas = list(raw.kpiReceitas, 'receitas').map(value => {
                const r = object(value, 'receita');
                return { categoria: text(r.categoria, 'categoria'), acumuladoMes: nonnegative(r.acumuladoMes, 'receita'), meta: nonnegative(r.meta, 'meta'), percentualMeta: nonnegative(r.percentualMeta, 'percentual') };
            });
            const planos = object(raw.planosAtivos, 'planos ativos');
            return { kpiReceitas: receitas, planosAtivos: nonnegative(planos.planosAtivos, 'planos ativos'), agendamentosPorServico: list(raw.agendamentosPorServico, 'agendamentos').map(value => { const x = object(value, 'agendamento'); return { servico: text(x.servico, 'serviço'), quantidadeAgendada: nonnegative(x.quantidadeAgendada, 'quantidade') }; }), graficoReceita: list(raw.graficoReceita, 'gráfico de receitas').map(value => object(value, 'mês')), graficoNovosServicos: list(raw.graficoNovosServicos, 'novos serviços').map(value => object(value, 'mês')), graficoContratosPorServico: list(raw.graficoContratosPorServico, 'contratos').map(value => object(value, 'categoria')), ultimasMovimentacoes: list(raw.ultimasMovimentacoes, 'movimentações').map(value => object(value, 'movimentação')) };
        },
        async services(signal) {
            return list(await send('/dashboard/servicos', {}, signal), 'serviços').map(raw => { const v = object(raw, 'serviço'); return { ...v, idServico: positiveId(v.idServico, 'serviço') }; });
        },
        async pendingMovements(signal) {
            return list(await send('/dashboard/movimentacoes', {}, signal), 'pendências').map(raw => { const m = object(raw, 'pendência'); return { ...m, id: positiveId(m.id, 'movimentação'), idContrato: positiveId(m.idContrato, 'contrato') }; });
        },
        /** DASH-05: caller provides an approved exact LocalDate, not a fabricated YearMonth conversion. */
        async goals(referenceDate, category, signal) {
            text(category, 'categoria');
            if (!/^\d{4}-\d{2}-\d{2}$/.test(referenceDate))
                throw new Error('Data inválida');
            return list(await send('/dashboard/metas', { query: { mesReferencia: referenceDate, servico: category } }, signal), 'metas').map(raw => { const m = object(raw, 'meta'); return { ...m, idMeta: positiveId(m.idMeta, 'meta') }; });
        },
        async saveGoal(body, target) {
            positiveId(body.servico?.idServico, 'serviço');
            if (!Number.isFinite(body.valor) || body.valor <= 0) throw new Error('Informe um valor maior que zero.');
            if (target !== undefined) positiveId(Number(target), 'meta');
            return send(target === undefined ? '/dashboard/metas' : `/dashboard/metas/${target}`, { method: target === undefined ? 'POST' : 'PUT', body });
        },
    };
}
