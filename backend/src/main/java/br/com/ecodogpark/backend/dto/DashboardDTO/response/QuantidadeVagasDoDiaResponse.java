package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dado de retorno de quantidade total de vagas para o dia")
public record QuantidadeVagasDoDiaResponse(
        @Schema(description = "Quantidade total de vagas para o dia")
        Integer quantideVagas
) {
}
