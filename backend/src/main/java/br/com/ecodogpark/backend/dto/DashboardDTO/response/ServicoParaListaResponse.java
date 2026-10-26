package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de retorno de servico para lista")
public record ServicoParaListaResponse(
        @Schema(description = "Identificador do serviço", example = "1")
        Integer idServico,
        @Schema(description = "Nome do serviço")
        String nome,
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Modalidade do serviço")
        String modalidade,
        @Schema(description = "Frequência", example = "2x")
        String frequencia,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor,
        @Schema(description = "Situação atual", example = "true")
        Boolean status
) {
}
