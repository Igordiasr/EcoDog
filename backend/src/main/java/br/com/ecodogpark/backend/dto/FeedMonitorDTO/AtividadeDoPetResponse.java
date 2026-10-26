package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoAtividade;

@Schema(description = "Dados de retorno de atividade do pet")
public record AtividadeDoPetResponse(
        @Schema(description = "Identificador da participação do pet na atividade", example = "1")
        Long idParticipacaoDoPet,
        @Schema(description = "Nome da atividade")
        String nomeAtividade,
        @Schema(description = "Categoria da atividade")
        String categoriaAtividade,
        @Schema(description = "Situação atual do registro")
        SituacaoAtividade situacao,
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao
) {


}