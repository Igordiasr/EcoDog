package br.com.ecodogpark.backend.dto.TwilioDTO;

import br.com.ecodogpark.backend.enums.OrigemMensagem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Mensagem registrada no histórico de um atendimento WhatsApp")
public record WhatsAppMensagemResponse(
        @Schema(description = "Identificador da mensagem", example = "105")
        Long idMensagem,
        @Schema(description = "Conteúdo textual da mensagem", example = "Qual o horário de funcionamento?")
        String conteudo,
        @Schema(description = "Origem da mensagem", example = "TUTOR")
        OrigemMensagem origem,
        @Schema(description = "Indica se a resposta do chatbot foi simulada e registrada para demonstração", example = "false")
        Boolean simulada,
        @Schema(description = "Data e hora em que a mensagem foi registrada", example = "2026-11-27T14:30:05")
        LocalDateTime criadaEm
) {
}
