package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Pet do tutor disponível para seleção no agendamento")
public record PetsDoTutorResponse(
        @Schema(description = "Identificador do pet", example = "9")
        Long idPet,
        @Schema(description = "Nome do pet", example = "Thor")
        String nomePet
) {
}
