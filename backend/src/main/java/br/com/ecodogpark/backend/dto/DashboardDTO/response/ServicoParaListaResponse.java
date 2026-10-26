package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import java.math.BigDecimal;

public record ServicoParaListaResponse(
        Integer idServico,
        String nome,
        String categoria,
        String modalidade,
        String frequencia,
        BigDecimal valor,
        Boolean status
) {
}
