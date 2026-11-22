package br.com.ecodogpark.backend.dto.GestaoCalendarioDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Dados de retorno de aluno agendado")
public record AlunoAgendadoResponse(
        @Schema(description = "Identificador do agendamento", example = "1")
        Long idAgendamento,
        @Schema(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID idPet,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Idade do pet em anos na data consultada", example = "1")
        Integer idade,
        @Schema(description = "Nome do tutor")
        String tutor,
        @Schema(description = "Situação atual do registro")
        String situacao
) {}
