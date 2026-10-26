package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados de retorno de atividades do dia")
public record AtividadesDoDiaResponse(
        @Schema(description = "Data de referência da consulta", example = "2026-10-26")
        LocalDate data,
        @Schema(description = "Atividades programadas para o dia atual")
        List<AtividadeProgramadaResponse> atividadesDoDia
) {
}
