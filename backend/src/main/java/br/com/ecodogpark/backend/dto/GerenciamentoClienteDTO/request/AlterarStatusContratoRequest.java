package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Dados para alterar a situação de um contrato")
public record AlterarStatusContratoRequest(

        @NotBlank
        @Pattern(
                regexp = "ATIVO|PENDENTE|CANCELADO|ENCERRADO",
                message = "Situação inválida"
        )
        @Schema(
                description = "Nova situação do contrato",
                allowableValues = {"ATIVO", "PENDENTE", "CANCELADO", "ENCERRADO"},
                example = "ATIVO"
        )
        String situacao
) {
}