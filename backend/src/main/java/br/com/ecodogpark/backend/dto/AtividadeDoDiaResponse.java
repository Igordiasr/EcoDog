package br.com.ecodogpark.backend.dto;

import br.com.ecodogpark.backend.entity.AtividadeEntity;

public record AtividadeDoDiaResponse(
        String nomeAtividade,
        Boolean status,
        String observacao
) {


}