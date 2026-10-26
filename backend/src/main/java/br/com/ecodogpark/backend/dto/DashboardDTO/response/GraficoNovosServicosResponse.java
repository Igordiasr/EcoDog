package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de grafico novos servicos")
public record GraficoNovosServicosResponse(
        @Schema(description = "Mês de referência", example = "2026-10")
        String mesReferencia,
        @Schema(description = "Quantidade de contratos de creche", example = "1")
        Long creche,
        @Schema(description = "Quantidade de contratos de hotel", example = "1")
        Long hotel,
        @Schema(description = "Quantidade de contratos de day use", example = "1")
        Long dayUse
) {
}
