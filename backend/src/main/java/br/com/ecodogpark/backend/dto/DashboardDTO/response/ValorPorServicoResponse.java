package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de retorno de valor por servico")
public record ValorPorServicoResponse(
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor
) {
}
