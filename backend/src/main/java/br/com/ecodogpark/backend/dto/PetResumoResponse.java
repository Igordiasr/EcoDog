package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

public record PetResumoResponse(
        Long idPet,
        String nome,
        Long idParticipacaoDoPet,
        Long idAgendamento
) {
}
