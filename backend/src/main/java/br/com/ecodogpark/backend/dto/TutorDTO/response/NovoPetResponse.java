package br.com.ecodogpark.backend.dto.TutorDTO.response;

import java.time.LocalDate;

public record NovoPetResponse(
        Long idPet,
        String nome,
        String raca,
        String sexo,
        Boolean castrado,
        LocalDate dataNascimento,
        String observacao,
        String relacaoComOutros,
        String veterinario,
        String telefoneVeterinario,
        Boolean convenio,
        Long idTutor
) {
}
