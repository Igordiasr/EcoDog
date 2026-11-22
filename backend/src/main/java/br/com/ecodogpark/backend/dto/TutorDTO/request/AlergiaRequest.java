package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record AlergiaRequest(
        @Schema(description = "Nome da alergia")
        @NotBlank
        String nome
) {
}
