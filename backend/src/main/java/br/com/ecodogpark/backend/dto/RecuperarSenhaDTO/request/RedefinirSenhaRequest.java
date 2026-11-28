package br.com.ecodogpark.backend.dto.RecuperarSenhaDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Token recebido por e-mail e nova senha")
public record RedefinirSenhaRequest(
        @Schema(description = "Token recebido no link de recuperação")
        @NotBlank
        String token,
        @Schema(description = "Nova senha da conta", example = "NovaSenha123!")
        @NotBlank
        @Size(min = 6, max = 100)
        String novaSenha
) {
}
