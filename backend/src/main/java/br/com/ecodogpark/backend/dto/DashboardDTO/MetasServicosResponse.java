package br.com.ecodogpark.backend.dto.DashboardDTO;

import java.math.BigDecimal;

public record MetasServicosResponse(
        Integer ano,
        Integer mes,
        BigDecimal valor
) {
}
