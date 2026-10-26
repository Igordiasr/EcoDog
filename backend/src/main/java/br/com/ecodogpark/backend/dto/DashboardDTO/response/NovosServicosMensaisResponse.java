package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de novos servicos mensais")
public record NovosServicosMensaisResponse(
        @Schema(description = "Ano de referência", example = "1")
        Integer ano,
        @Schema(description = "Número do mês de referência", example = "1")
        Integer mes,
        @Schema(description = "Quantidade de contratos de creche", example = "1")
        Long creche,
        @Schema(description = "Quantidade de contratos de hotel", example = "1")
        Long hotel,
        @Schema(description = "Quantidade de contratos de day use", example = "1")
        Long dayUse
) {
}
