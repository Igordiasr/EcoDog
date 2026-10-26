package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoMedicacao;

@Schema(description = "Dados de retorno de medicacao do dia")
public record MedicacaoDoDiaResponse(
        @Schema(description = "Identificador da medicação do dia", example = "1")
        Long idMedicacaoDoDia,
        @Schema(description = "Nome da medicação")
        String nomeMedicacao,
        @Schema(description = "Situação atual")
        SituacaoMedicacao status,
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao
) {
}