package br.com.ecodogpark.backend.dto.TutorDTO.response;

import br.com.ecodogpark.backend.enums.DiaSemana;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MeusAgendamentosResponse(
        UUID idPet,
        String nomePet,
        String servico,
        Integer quantidadeDias,
        List<DiaSemana> diasDaSemana,
        List<LocalDate> diasAgendados
) {}