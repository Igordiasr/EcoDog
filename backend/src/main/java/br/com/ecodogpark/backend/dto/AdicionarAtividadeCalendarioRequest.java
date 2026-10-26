package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

@Schema(description = "Dados de entrada para adicionar atividade calendario")
public record AdicionarAtividadeCalendarioRequest(
        @NotNull @Positive @Schema(description = "Identificador da atividade no catálogo", example = "1")
        Integer idAtividade,
        @NotNull @Schema(description = "Horário de início da atividade", example = "09:00:00")
        LocalTime horaInicio,
        @NotNull @Schema(description = "Horário de término da atividade", example = "10:00:00")
        LocalTime horaFim
) {}
