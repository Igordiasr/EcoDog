package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @Schema(description = "Rua", example = "Rua das Flores")
        @NotBlank @Size(max = 150)
        String rua,

        @Schema(description = "Número", example = "123")
        @NotBlank @Size(max = 10)
        String numero,

        @Schema(description = "Complemento", example = "Casa 2")
        @Size(max = 100)
        String complemento,

        @Schema(description = "Bairro", example = "Centro")
        @NotBlank @Size(max = 100)
        String bairro,

        @Schema(description = "Cidade", example = "São Paulo")
        @NotBlank @Size(max = 100)
        String cidade,

        @Schema(description = "CEP", example = "12345678")
        @NotBlank @Size(max = 8)
        String cep
) {
}
