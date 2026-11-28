package br.com.ecodogpark.backend.dto.GestaoCalendarioDTO;

import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Situação solicitada para cancelar um agendamento do calendário")
public record CancelarAgendamentoCalendarioRequest(
        @NotNull @Schema(description = "Nova situação; deve ser CANCELADO", example = "CANCELADO", allowableValues = {"CANCELADO"})
        SituacaoAgendamento situacao
) {}
