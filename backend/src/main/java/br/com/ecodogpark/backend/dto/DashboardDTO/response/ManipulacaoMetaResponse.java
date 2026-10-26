package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.ServicosEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados de retorno de manipulacao meta")
public record ManipulacaoMetaResponse(
        @Schema(description = "Mês de referência", example = "2026-10-26")
        LocalDate mesReferencia,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor,
        @Schema(description = "Serviço associado")
        ServicoParaListaResponse servico
) {
}
