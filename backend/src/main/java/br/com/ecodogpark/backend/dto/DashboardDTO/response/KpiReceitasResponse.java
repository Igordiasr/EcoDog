package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import java.math.BigDecimal;

public record KpiReceitasResponse(
        String categoria,
        BigDecimal acumuladoMes,
        BigDecimal meta,
        BigDecimal percentualMeta
) {
}
