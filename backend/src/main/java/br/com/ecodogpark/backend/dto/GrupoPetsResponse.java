package br.com.ecodogpark.backend.dto;

import java.util.List;

public record GrupoPetsResponse(
        Integer grupo,
        List<PetPoucosDetalhesResponse> petsDoGrupo
) {
}
