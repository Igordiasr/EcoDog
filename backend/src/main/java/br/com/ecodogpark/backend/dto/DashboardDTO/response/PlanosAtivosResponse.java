package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de planos ativos")
public record PlanosAtivosResponse(
        @Schema(description = "Quantidade de planos ativos", example = "1")
        Long planosAtivos
) {
}
