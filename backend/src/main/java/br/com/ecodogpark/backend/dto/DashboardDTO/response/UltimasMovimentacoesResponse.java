package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados de retorno de ultimas movimentacoes")
public record UltimasMovimentacoesResponse(
        @Schema(description = "Data do pagamento", example = "2026-10-26")
        LocalDate dataPagamento,
        @Schema(description = "Serviço associado")
        String servico,
        @Schema(description = "Nome do pet")
        String pet,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor
) {
}
