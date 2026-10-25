package br.com.ecodogpark.backend.dto.TwilioDTO;

import java.time.LocalDateTime;

public record AtendimentoPendenteRequest(
        Long protocolo,
        String remetente,
        String mensagem,
        LocalDateTime dataHora,
        String status
) {
}
