package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaParaListaResponse(
        Long idMeta,
        LocalDate mesReferencia,
        BigDecimal valor,
        ServicoParaListaResponse servico
) {
}
