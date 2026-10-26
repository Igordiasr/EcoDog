package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import br.com.ecodogpark.backend.entity.ServicosEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ManipulacaoMetaResponse(
        LocalDate mesReferencia,
        BigDecimal valor,
        ServicoParaListaResponse servico
) {
}
