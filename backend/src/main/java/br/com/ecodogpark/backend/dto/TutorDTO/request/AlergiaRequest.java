package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlergiaRequest(
        @Schema(description = "Nome da alergia")
        @NotBlank @Size(max = 200)
        String nome
) {
}
