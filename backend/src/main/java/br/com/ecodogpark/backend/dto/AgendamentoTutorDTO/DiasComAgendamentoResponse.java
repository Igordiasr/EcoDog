package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.time.LocalDate;

public record DiasComAgendamentoResponse(
        LocalDate data,
        Long totalPetsAgendados
){}