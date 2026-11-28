package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Dados de retorno de dados dashboard")
public record DadosDashboardResponse(
        @Schema(description = "Indicadores de receitas por categoria")
        List<KpiReceitasResponse> kpiReceitas,
        @Schema(description = "Quantidade de planos ativos")
        PlanosAtivosResponse planosAtivos,
        @Schema(description = "Indicador de pets agendados por serviço e quantidade total de vagas para o dia")
        PetsPrevistosKpiResponse petsPrevistosKpi,
        @Schema(description = "Receitas previstas e recebidas por mês")
        List<GraficoReceitaResponse> graficoReceita,
        @Schema(description = "Novos serviços contratados por mês")
        List<GraficoNovosServicosResponse> graficoNovosServicos,
        @Schema(description = "Quantidade de contratos por categoria de serviço")
        List<GraficoContratosPorServicoResponse> graficoContratosPorServico,
        @Schema(description = "Últimas movimentações financeiras")
        List<UltimasMovimentacoesResponse> ultimasMovimentacoes
) {
}
