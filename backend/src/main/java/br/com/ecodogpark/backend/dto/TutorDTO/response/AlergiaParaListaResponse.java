package br.com.ecodogpark.backend.dto.TutorDTO.response;

import br.com.ecodogpark.backend.entity.AlergiasEntity;

public record AlergiaParaListaResponse(
        AlergiasEntity alergia
) {
}
