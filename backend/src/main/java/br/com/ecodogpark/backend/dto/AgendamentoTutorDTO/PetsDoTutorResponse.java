package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Pet do tutor disponível para seleção no agendamento")
public record PetsDoTutorResponse(
        @Schema(description = "Identificador do pet", example = "2918d4db-6978-5243-b77d-9f4aa09cfead")
        UUID idPet,
        @Schema(description = "Nome do pet", example = "Thor")
        String nomePet,
        @Schema(description = "Indica se o pet foi aprovado na adaptação")
        Boolean statusAdaptacao
) {
}
