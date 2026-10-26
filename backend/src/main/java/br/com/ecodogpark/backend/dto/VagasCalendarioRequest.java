package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Schema(description = "Dados de entrada para vagas calendario")
public record VagasCalendarioRequest(
        @NotNull @PositiveOrZero @Schema(description = "Quantidade de vagas de creche para o dia", example = "1")
        Integer vagasCreche,
        @NotNull @PositiveOrZero @Schema(description = "Quantidade de vagas de hotel para o dia", example = "1")
        Integer vagasHotel
) {}
