package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.MedicacoesEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Dados de entrada para cadastro medicacao pet")
public record CadastroMedicacaoPetRequest(
        @Schema(description = "Medicação associada ao pet")
        @NotNull
        Long idMedicacao,

        @Schema(description = "Frequência", example = "A cada 12 horas")
        @NotBlank
        String frequencia,

        @Schema(description = "Dosagem prescrita para a medicação", example = "1 comprimido")
        @NotBlank
        String dosagem,

        @Schema(description = "Indica se a medicação está em uso", example = "true")
        @NotNull
        Boolean emUso
) {
}
