package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Dados de retorno de grupo pets")
public record GrupoPetsResponse(
        @Schema(description = "Número do grupo de pets", example = "1")
        Integer grupo,
        @Schema(description = "Pets pertencentes ao grupo")
        List<PetPoucosDetalhesResponse> petsDoGrupo
) {
}
