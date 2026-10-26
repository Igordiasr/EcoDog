package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalTime;
import java.util.List;

@Schema(description = "Dados de retorno de atividade programada")
public record AtividadeProgramadaResponse(
        @Schema(description = "Identificador da atividade programada no dia; nulo em itens do catálogo", example = "1")
        Long idAtividadeDoDia,
        @Schema(description = "Nome da atividade")
        String nome,
        @Schema(description = "Descrição")
        String descricao,
        @Schema(description = "Categoria")
        String categoria,
        @Schema(description = "Horário de início da atividade", example = "09:00:00")
        LocalTime horaInicio,
        @Schema(description = "Horário de término da atividade", example = "10:00:00")
        LocalTime horaFim,
        @Schema(description = "Situação atual do registro")
        String situacao,
        @Schema(description = "Grupos de pets participantes da atividade")
        List<GrupoPetsResponse> grupos
) {
}
