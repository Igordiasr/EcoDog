package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Dados de retorno de pet poucos detalhes")
public record PetPoucosDetalhesResponse(
        @Schema(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID idPet,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Identificador da participação do pet na atividade", example = "1")
        Long idParticipacaoDoPet,
        @Schema(description = "Identificador do agendamento", example = "1")
        Long idAgendamento
) {
}
