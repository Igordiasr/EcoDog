package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.AlergiasEntity;

@Schema(description = "Dados de entrada para cadastro alergia pet")
public record CadastroAlergiaPetRequest(
        @Schema(description = "Alergia associada ao pet")
        AlergiasEntity alergia
) {
}
