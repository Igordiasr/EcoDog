package br.com.ecodogpark.backend.dto.DiarioPetTutor;

import br.com.ecodogpark.backend.entity.SituacaoAtividade;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalTime;

@Schema(description = "Dados de retorno de atividade diario pet")
public record AtividadeDiarioPetResponse(
        @Schema(description = "Nome da atividade")
        String nome,
        @Schema(description = "Horário de início da atividade")
        LocalTime horarioInicio,
        @Schema(description = "Horário de encerramento da atividade")
        LocalTime horarioFim,
        @Schema(description = "Descrição da atividade")
        String descricao,
        @Schema(description = "Participação do pet na atividade")
        SituacaoAtividade situacao,
        @Schema(description = "Observações da participação do pet na atividade")
        String observacao,
        @Schema(description = "Situação da atividade")
        String situacaoAtividade
) {
}
