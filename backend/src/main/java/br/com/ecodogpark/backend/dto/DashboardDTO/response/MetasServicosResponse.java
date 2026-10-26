package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de retorno de metas servicos")
public record MetasServicosResponse(
        @Schema(description = "Ano de referência", example = "1")
        Integer ano,
        @Schema(description = "Número do mês de referência", example = "1")
        Integer mes,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor
) {
}
