package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de pet poucos detalhes")
public record PetPoucosDetalhesResponse(
        @Schema(description = "Identificador do pet", example = "1")
        Long idPet,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Identificador da participação do pet na atividade", example = "1")
        Long idParticipacaoDoPet,
        @Schema(description = "Identificador do agendamento", example = "1")
        Long idAgendamento
) {
}
