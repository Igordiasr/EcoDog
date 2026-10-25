package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record AtualizarAtividadeRequest(
        @NotBlank
        @Pattern(regexp = "PENDENTE|CONCLUIDA|NAO_CONCLUIDA")
        String situacao,
        @Positive
        @NotNull
        Long idAtividade
) {
}
