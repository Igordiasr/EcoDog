package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de resumo diario pet")
public record ResumoDiarioPetResponse(
        @Schema(description = "Texto com o resumo das refeições do dia")
        String statusRefeicao,
        @Schema(description = "Texto com o resumo da participação nas atividades do dia")
        String statusEngajamento
) {
}
