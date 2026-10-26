package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultado do cancelamento do agendamento")
public record CancelamentoResponse(
        @Schema(description = "Mensagem com o resultado do cancelamento", example = "Agendamento cancelado.")
        String mensagem
) {
}
