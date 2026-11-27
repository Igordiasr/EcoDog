package br.com.ecodogpark.backend.dto.TwilioDTO;

import br.com.ecodogpark.backend.enums.SituacaoAtendimento;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Resumo de um atendimento recebido pelo WhatsApp")
public record WhatsAppAtendimentoResponse(
        @Schema(description = "Identificador do atendimento", example = "42")
        Long idAtendimento,
        @Schema(description = "Número de WhatsApp do tutor", example = "whatsapp:+5511912345678")
        String numeroTutor,
        @Schema(description = "Situação atual do atendimento", example = "PENDENTE")
        SituacaoAtendimento situacao,
        @Schema(description = "Data e hora em que o atendimento foi iniciado", example = "2026-11-27T14:30:00")
        LocalDateTime iniciadoEm
) {
}
