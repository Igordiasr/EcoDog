package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record VagasCalendarioRequest(
        @NotNull @PositiveOrZero Integer vagasCreche,
        @NotNull @PositiveOrZero Integer vagasHotel
) {}
