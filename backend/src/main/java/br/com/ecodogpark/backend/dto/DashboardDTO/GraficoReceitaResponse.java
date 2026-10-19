package br.com.ecodogpark.backend.dto.DashboardDTO;

import java.math.BigDecimal;

public record GraficoReceitaResponse(
        String mesReferencia,
        BigDecimal receitaPrevista,
        BigDecimal receitaRecebida
) {
}
