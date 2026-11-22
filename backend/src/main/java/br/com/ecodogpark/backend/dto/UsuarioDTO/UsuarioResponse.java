package br.com.ecodogpark.backend.dto.UsuarioDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Dados de retorno de usuario")
public record UsuarioResponse
        (@Schema(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
        UUID id,
        @Schema(description = "Nome do usuário")
        String nome,
        @Schema(description = "Endereço de e-mail do usuário", example = "usuario@example.com")
        String email,
        @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        String telefone
) {
}
