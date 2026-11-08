package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Soma das vagas configuradas no calendário para um intervalo de datas")
public record VagasTotaisMesResponse(
        @Schema(description = "Soma das vagas de Creche; nula quando não há vagas configuradas no intervalo", example = "620") Long vagasCreche,
        @Schema(description = "Soma das vagas de Hotel; nula quando não há vagas configuradas no intervalo", example = "480") Long vagasHotel
) {}
