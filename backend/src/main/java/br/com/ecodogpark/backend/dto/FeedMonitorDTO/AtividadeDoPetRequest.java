package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoAtividade;

@Schema(description = "Dados de entrada para atividade do pet")
public record AtividadeDoPetRequest(
        @Schema(description = "Situação atual do registro")
        SituacaoAtividade situacao,
        @Schema(description = "Justificativa obrigatória quando a situação for NAO_PARTICIPOU")
        String observacao
) {
}
