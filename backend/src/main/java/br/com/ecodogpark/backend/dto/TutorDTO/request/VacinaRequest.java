package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VacinaRequest(
        @Schema(description = "Nome da vacina aplicada ao pet", example = "V10")
        @NotBlank @Size(max = 100)
        String nome,

        @Schema(description = "Tipo ou finalidade da vacina aplicada ao pet.", example = "Polivalente")
        @NotBlank @Size(max = 100)
        String tipo
) {}