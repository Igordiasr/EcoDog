package br.com.ecodogpark.backend.dto.UsuarioDTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Credenciais de acesso do usuário")
public record LoginRequest(
        @Schema(description = "E-mail cadastrado do usuário", example = "usuario@example.com")
        @NotNull @Email String email,
        @Schema(description = "Senha de acesso do usuário", example = "Senha123!", accessMode = Schema.AccessMode.WRITE_ONLY)
        @NotBlank String senha
) {
}
