package br.com.ecodogpark.backend.dto.UsuarioDTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Token de acesso retornado após autenticação do usuário")
public record LoginResponse(
        @Schema(description = "Token JWT assinado, com validade de 10 minutos. Envie em Authorization: Bearer <token>", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0In0.assinatura", accessMode = Schema.AccessMode.READ_ONLY)
        String token
) {
}
