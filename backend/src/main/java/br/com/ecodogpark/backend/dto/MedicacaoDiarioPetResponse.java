package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoMedicacao;

@Schema(description = "Dados de retorno de medicacao diario pet")
public record MedicacaoDiarioPetResponse(
        @Schema(description = "Nome da medicação")
        String nome,
        @Schema(description = "Situação atual")
        SituacaoMedicacao status
) {
}
