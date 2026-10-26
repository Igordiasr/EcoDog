package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados de retorno de meta para lista")
public record MetaParaListaResponse(
        @Schema(description = "Identificador da meta", example = "1")
        Long idMeta,
        @Schema(description = "Mês de referência", example = "2026-10-26")
        LocalDate mesReferencia,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor,
        @Schema(description = "Serviço associado")
        ServicoParaListaResponse servico
) {
}
