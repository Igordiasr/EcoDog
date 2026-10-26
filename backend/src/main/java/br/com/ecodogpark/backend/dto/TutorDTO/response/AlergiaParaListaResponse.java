package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.AlergiasEntity;

@Schema(description = "Dados de retorno de alergia para lista")
public record AlergiaParaListaResponse(
        @Schema(description = "Alergia associada ao pet")
        AlergiasEntity alergia
) {
}
