package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MedicacaoRequest(
        @Schema(description = "Nome do medicamento que o pet utiliza", example = "Dipirona")
        @NotBlank @Size(max = 100)
        String nome,

        @Schema(description = "Tipo ou finalidade do medicamento utilizado pelo pet.", example = "Analgésico")
        @NotBlank @Size(max = 100)
        String tipo
){}
