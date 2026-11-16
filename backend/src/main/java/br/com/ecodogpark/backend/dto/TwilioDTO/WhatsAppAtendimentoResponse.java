package br.com.ecodogpark.backend.dto.TwilioDTO;

import br.com.ecodogpark.backend.enums.SituacaoAtendimento;

import java.time.LocalDateTime;

public record WhatsAppAtendimentoResponse(
        Long idAtendimento,
        String numeroTutor,
        SituacaoAtendimento situacao,
        LocalDateTime iniciadoEm
) {
}
