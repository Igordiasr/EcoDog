package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import java.util.List;

public record GrupoPetsResponse(
        Integer grupo,
        List<PetPoucosDetalhesResponse> petsDoGrupo
) {
}
