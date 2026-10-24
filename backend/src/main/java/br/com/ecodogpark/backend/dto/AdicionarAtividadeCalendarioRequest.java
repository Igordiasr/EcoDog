package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

public record AdicionarAtividadeCalendarioRequest(
        @NotNull @Positive Integer idAtividade,
        @NotNull LocalTime horaInicio,
        @NotNull LocalTime horaFim
) {}
