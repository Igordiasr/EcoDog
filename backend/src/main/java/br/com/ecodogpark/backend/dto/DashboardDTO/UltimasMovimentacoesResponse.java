package br.com.ecodogpark.backend.dto.DashboardDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UltimasMovimentacoesResponse(
        LocalDate dataPagamento,
        String servico,
        String pet,
        BigDecimal valor
) {
}
