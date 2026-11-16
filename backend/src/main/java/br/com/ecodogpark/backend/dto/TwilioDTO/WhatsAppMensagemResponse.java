package br.com.ecodogpark.backend.dto.TwilioDTO;

import br.com.ecodogpark.backend.enums.OrigemMensagem;

import java.time.LocalDateTime;

public record WhatsAppMensagemResponse(
        Long idMensagem,
        String conteudo,
        OrigemMensagem origem,
        Boolean simulada,
        LocalDateTime criadaEm
) {
}
