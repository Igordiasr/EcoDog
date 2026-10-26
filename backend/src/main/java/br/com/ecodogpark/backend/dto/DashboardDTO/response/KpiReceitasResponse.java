package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de retorno de kpi receitas")
public record KpiReceitasResponse(
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Receita acumulada no mês em reais", example = "1500.00")
        BigDecimal acumuladoMes,
        @Schema(description = "Meta de receita em reais", example = "1500.00")
        BigDecimal meta,
        @Schema(description = "Percentual da meta atingido", example = "1500.00")
        BigDecimal percentualMeta
) {
}
