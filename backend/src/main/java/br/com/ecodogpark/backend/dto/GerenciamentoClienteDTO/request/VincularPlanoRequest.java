package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "Dados para vincular um serviço ao contrato")
public record VincularPlanoRequest(
        @NotNull
        @Positive
        @Schema(description = "Identificador do serviço", example = "2")
        Integer idServico

) {
}