package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.MedicacoesEntity;

@Schema(description = "Dados de entrada para cadastro medicacao pet")
public record CadastroMedicacaoPetRequest(
        @Schema(description = "Medicação associada ao pet")
        MedicacoesEntity medicacao,
        @Schema(description = "Frequência", example = "A cada 12 horas")
        String frequencia,
        @Schema(description = "Dosagem prescrita para a medicação", example = "1 comprimido")
        String dosagem,
        @Schema(description = "Indica se a medicação está em uso", example = "true")
        Boolean emUso
) {
}
