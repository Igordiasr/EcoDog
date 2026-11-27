package br.com.ecodogpark.backend.dto.PlanoDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Dados para ativar ou desativar um serviço ou plano")
public record AtualizarStatusRequest(
        @NotNull
        @Schema(description = "Indica se o serviço/plano ficará ativo", example = "true")
        Boolean status
) {
}
