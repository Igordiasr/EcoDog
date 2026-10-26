package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de grafico contratos por servico")
public record GraficoContratosPorServicoResponse(
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Quantidade", example = "1")
        Long quantidade
) {
}
