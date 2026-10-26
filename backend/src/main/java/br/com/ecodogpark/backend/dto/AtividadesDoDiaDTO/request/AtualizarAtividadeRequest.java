package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

@Schema(description = "Dados de entrada para atualizar atividade")
public record AtualizarAtividadeRequest(
        @NotBlank
        @Pattern(regexp = "PENDENTE|CONCLUIDA|NAO_CONCLUIDA")
        @Schema(description = "Nova situação da atividade do dia", allowableValues = {"PENDENTE", "CONCLUIDA", "NAO_CONCLUIDA"})
        String situacao,
        @Positive
        @NotNull
        @Schema(description = "Identificador da atividade programada no dia; nulo em itens do catálogo", example = "1")
        Long idAtividadeDoDia
) {
}
