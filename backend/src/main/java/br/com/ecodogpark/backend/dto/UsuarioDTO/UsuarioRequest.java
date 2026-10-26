package br.com.ecodogpark.backend.dto.UsuarioDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

@Schema(description = "Dados de entrada para usuario")
public record UsuarioRequest(
        @NotBlank @Size(max = 120) @Schema(description = "Nome do usuário")
        String nome,
        @NotBlank @Email @Size(max = 150) @Schema(description = "Endereço de e-mail do usuário", example = "usuario@example.com")
        String email,
        @NotBlank @CPF @Size(max = 11) @Schema(description = "CPF do usuário, com 11 dígitos e sem pontuação", example = "52998224725")
        String cpf,
        @NotBlank @Size(max = 20) @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        String telefone,
        @NotBlank @Size(min = 6, max = 100) @Schema(description = "Senha de acesso do usuário", accessMode = Schema.AccessMode.WRITE_ONLY, example = "Senha123!")
        String senha
) {
}
