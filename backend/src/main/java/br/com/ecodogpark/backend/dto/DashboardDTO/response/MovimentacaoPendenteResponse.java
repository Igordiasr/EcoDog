package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoPendenteResponse(
        Long id,
        LocalDate dataRegistro,
        String usuario,
        String pet,
        String servico,
        BigDecimal valor,
        Long idContrato
) {
}
