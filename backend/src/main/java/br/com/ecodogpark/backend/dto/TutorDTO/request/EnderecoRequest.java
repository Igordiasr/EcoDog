package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record EnderecoRequest(
        @Schema(description = "Rua", example = "Rua das Flores")
        @NotBlank
        String rua,

        @Schema(description = "Número", example = "123")
        @NotBlank
        String numero,

        @Schema(description = "Complemento", example = "Casa 2")
        String complemento,

        @Schema(description = "Bairro", example = "Centro")
        @NotBlank
        String bairro,

        @Schema(description = "Cidade", example = "São Paulo")
        @NotBlank
        String cidade,

        @Schema(description = "CEP", example = "12345678")
        @NotBlank
        String cep
) {
}
