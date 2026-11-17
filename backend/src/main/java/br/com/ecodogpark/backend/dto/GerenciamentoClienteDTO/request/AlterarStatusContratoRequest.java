package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Dados para alterar a situação de um contrato")
public record AlterarStatusContratoRequest(
        @NotNull
        @Schema(
                description = "True para ativar e false para encerrar o contrato",
                example = "false"
        )
        Boolean ativo
) {
}