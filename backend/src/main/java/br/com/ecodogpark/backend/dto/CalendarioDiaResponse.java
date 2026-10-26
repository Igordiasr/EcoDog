package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados de retorno de calendario dia")
public record CalendarioDiaResponse(
        @Schema(description = "Identificador do calendário; nulo quando o dia ainda não foi configurado", example = "1")
        Long idCalendario,
        @Schema(description = "Data de referência da consulta", example = "2026-10-26")
        LocalDate data,
        @Schema(description = "Quantidade de vagas de creche para o dia", example = "1")
        Integer vagasCreche,
        @Schema(description = "Quantidade de vagas de hotel para o dia", example = "1")
        Integer vagasHotel,
        @Schema(description = "Atividades registradas para a data consultada")
        List<AtividadeCalendarioResponse> atividades,
        @Schema(description = "Pets com agendamento na data consultada")
        List<AlunoAgendadoResponse> alunosAgendados
) {}
