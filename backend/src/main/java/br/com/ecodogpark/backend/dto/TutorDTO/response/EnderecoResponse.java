package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record EnderecoResponse(
        @Schema(description = "Rua", example = "Rua das Flores")
        String rua,
        @Schema(description = "Número", example = "123")
        String numero,
        @Schema(description = "Complemento", example = "Casa 2")
        String complemento,
        @Schema(description = "Bairro", example = "Centro")
        String bairro,
        @Schema(description = "Cidade", example = "São Paulo")
        String cidade,
        @Schema(description = "CEP", example = "12345678")
        String cep
) {
}
