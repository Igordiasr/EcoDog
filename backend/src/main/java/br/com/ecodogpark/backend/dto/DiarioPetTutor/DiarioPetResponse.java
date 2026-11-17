package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Schema(description = "Dados de retorno de diario pet")
public record DiarioPetResponse(
        @Schema(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID idPet,
        @Schema(description = "Data de referência da consulta", example = "2026-10-26")
        LocalDate data,
        @Schema(description = "Resumo das refeições e da participação nas atividades do dia")
        ResumoDiarioPetResponse resumo,
        @Schema(description = "Atividades registradas para a data consultada")
        List<AtividadeDiarioPetResponse> atividades,
        @Schema(description = "Medicações registradas para o pet na data consultada")
        List<MedicacaoDiarioPetResponse> medicacoes,
        @Schema(description = "Observações do dia concatenadas com quebras de linha")
        String observacoes
) {
}
