package br.com.ecodogpark.backend.dto.TutorDTO.request;

import br.com.ecodogpark.backend.entity.AlergiasEntity;

public record CadastroAlergiaPetRequest(
        AlergiasEntity alergia
) {
}
