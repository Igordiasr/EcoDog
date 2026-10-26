package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

public record PetPoucosDetalhesResponse(
        Long idPet,
        String nome,
        Long idParticipacaoDoPet,
        Long idAgendamento
) {
}
