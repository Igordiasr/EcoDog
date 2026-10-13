package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import br.com.ecodogpark.backend.entity.SituacaoAtividade;

public record AtividadeDoPetRequest(
        SituacaoAtividade situacao,
        String observacao
) {
}
