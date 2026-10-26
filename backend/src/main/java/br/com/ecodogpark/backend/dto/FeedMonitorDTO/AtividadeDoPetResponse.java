package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import br.com.ecodogpark.backend.entity.SituacaoAtividade;

public record AtividadeDoPetResponse(
        Long idParticipacaoDoPet,
        String nomeAtividade,
        String categoriaAtividade,
        SituacaoAtividade situacao,
        String observacao
) {


}