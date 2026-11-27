package br.com.ecodogpark.backend.dto.RecuperarSenhaDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "E-mail usado para solicitar a recuperação de senha")
public record SolicitarRecuperacaoSenhaRequest(
        @Schema(description = "E-mail cadastrado na conta", example = "usuario@example.com")
        @NotBlank
        @Email
        @Size(max = 150)
        String email
) {
}
