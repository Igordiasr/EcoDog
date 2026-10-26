package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Quantidade de pets agendados em uma data")
public record DiasComAgendamentoResponse(
        @Schema(description = "Data de referência no formato yyyy-MM-dd", example = "2026-11-03")
        LocalDate data,
        @Schema(description = "Quantidade de pets agendados na data", example = "5")
        Long totalPetsAgendados
){}