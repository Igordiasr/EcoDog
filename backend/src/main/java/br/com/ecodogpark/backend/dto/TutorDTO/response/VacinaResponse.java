package br.com.ecodogpark.backend.dto.TutorDTO.response;

public record VacinaResponse(
        Integer idVacina,
        String nome,
        String tipo
) {}