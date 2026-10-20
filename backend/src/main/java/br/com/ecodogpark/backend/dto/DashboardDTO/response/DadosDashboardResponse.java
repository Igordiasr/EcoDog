package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import java.util.List;

public record DadosDashboardResponse(
        List<KpiReceitasResponse> kpiReceitas,
        PlanosAtivosResponse planosAtivos,
        List<AgendamentosPorServicoResponse> agendamentosPorServico,
        List<GraficoReceitaResponse> graficoReceita,
        List<GraficoNovosServicosResponse> graficoNovosServicos,
        List<GraficoContratosPorServicoResponse> graficoContratosPorServico,
        List<UltimasMovimentacoesResponse> ultimasMovimentacoes
) {
}
