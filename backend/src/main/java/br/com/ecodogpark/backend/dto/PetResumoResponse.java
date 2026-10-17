package br.com.ecodogpark.backend.dto;

public record PetResumoResponse(
        Long idPet,
        String nome,
        Long idParticipacaoDoPet,
        Long idAgendamento
) {
}
