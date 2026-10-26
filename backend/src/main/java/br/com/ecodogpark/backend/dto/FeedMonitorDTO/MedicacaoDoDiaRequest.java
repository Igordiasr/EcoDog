package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoMedicacao;

@Schema(description = "Dados de entrada para medicacao do dia")
public record MedicacaoDoDiaRequest(
        @Schema(description = "Situação atual do registro")
        SituacaoMedicacao situacao,
        @Schema(description = "Justificativa obrigatória quando a situação for NAO_TOMOU")
        String observacao
) {
}
