package br.com.ecodogpark.backend.dto;

public record PetPoucosDetalhesResponse(
        Long idPet,
        String nome,
        Long idParticipacaoDoPet,
        Long idAgendamento
) {
}
