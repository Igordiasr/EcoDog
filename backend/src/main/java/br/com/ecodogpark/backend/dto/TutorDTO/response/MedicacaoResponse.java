package br.com.ecodogpark.backend.dto.TutorDTO.response;

public record MedicacaoResponse(
        Long idMedicacao,
        String nome,
        String tipo
) {}