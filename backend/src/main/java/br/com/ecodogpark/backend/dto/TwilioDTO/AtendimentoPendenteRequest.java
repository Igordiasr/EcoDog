package br.com.ecodogpark.backend.dto.TwilioDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados de um atendimento pendente encaminhado para atendimento humano")
public record AtendimentoPendenteRequest(
        @Schema(description = "Número do protocolo de atendimento humano", example = "1")
        Long protocolo,
        @Schema(description = "Número do remetente no formato WhatsApp da Twilio", example = "whatsapp:+5511912345678")
        String remetente,
        @Schema(description = "Mensagem enviada pelo remetente", example = "Preciso falar com um atendente")
        String mensagem,
        @Schema(description = "Data e horário da solicitação de atendimento", example = "2026-10-26T08:00:00")
        LocalDateTime dataHora,
        @Schema(description = "Situação atual do atendimento", example = "PENDENTE")
        String status
) {
}
