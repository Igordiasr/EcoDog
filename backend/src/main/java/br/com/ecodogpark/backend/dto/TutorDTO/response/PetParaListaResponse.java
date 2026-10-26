package br.com.ecodogpark.backend.dto.TutorDTO.response;

import java.time.LocalDate;

public record PetParaListaResponse(
        Long idPet,
        String nome,
        String raca,
        String sexo,
        Boolean castrado,
        LocalDate dataNascimento
) {
}
