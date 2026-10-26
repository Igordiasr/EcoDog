package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Dados de retorno de atividade do dia query")
public record AtividadeDoDiaQueryResponse(
        @Schema(description = "Identificador da atividade programada no dia; nulo em itens do catálogo", example = "1")
        Long idAtividadeDoDia,
        @Schema(description = "Data do agendamento", example = "2026-10-26")
        LocalDate dataAgendamento,
        @Schema(description = "Nome da atividade")
        String atividade,
        @Schema(description = "Descrição")
        String descricao,
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Horário de início da atividade", example = "09:00:00")
        LocalTime horaInicio,
        @Schema(description = "Horário de término da atividade", example = "10:00:00")
        LocalTime horaFim,
        @Schema(description = "Situação da atividade do dia")
        String andamento,
        @Schema(description = "Identificador do agendamento", example = "1")
        Long idAgendamento,
        @Schema(description = "Identificador da participação do pet na atividade", example = "1")
        Long idParticipacaoDoPet,
        @Schema(description = "Identificador do pet", example = "1")
        Long idPet,
        @Schema(description = "Nome do pet", example = "Thor")
        String nomeDoPet,
        @Schema(description = "Número do grupo de pets", example = "1")
        Integer grupo
) {
}
