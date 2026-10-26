package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de retorno de grafico receita")
public record GraficoReceitaResponse(
        @Schema(description = "Mês de referência", example = "2026-10")
        String mesReferencia,
        @Schema(description = "Receita prevista em reais", example = "1500.00")
        BigDecimal receitaPrevista,
        @Schema(description = "Receita recebida em reais", example = "1500.00")
        BigDecimal receitaRecebida
) {
}
