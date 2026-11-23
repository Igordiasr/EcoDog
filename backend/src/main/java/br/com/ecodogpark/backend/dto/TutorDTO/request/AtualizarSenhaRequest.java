package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarSenhaRequest(
        @Schema(description = "Senha atual do tutor")
        @NotBlank
        String senhaAtual,

        @Schema(description = "Nova senha do tutor")
        @NotBlank @Size(min = 8, max = 100)
        String novaSenha
) {
}
