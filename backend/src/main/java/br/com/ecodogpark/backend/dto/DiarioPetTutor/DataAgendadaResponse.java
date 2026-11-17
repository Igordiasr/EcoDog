package br.com.ecodogpark.backend.dto.DiarioPetTutor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

public record DataAgendadaResponse(
        @Schema(description = "Datas de agendamentos anteriores")
        LocalDate data
) {
}
