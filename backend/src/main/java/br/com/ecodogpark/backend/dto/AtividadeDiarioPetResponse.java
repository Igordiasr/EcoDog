package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de atividade diario pet")
public record AtividadeDiarioPetResponse(
        @Schema(description = "Descrição")
        String descricao
) {
}
