package br.com.ecodogpark.backend.dto.DashboardDTO;

import java.math.BigDecimal;

public record ValorPorServicoResponse(
        String categoria,
        BigDecimal valor
) {
}
