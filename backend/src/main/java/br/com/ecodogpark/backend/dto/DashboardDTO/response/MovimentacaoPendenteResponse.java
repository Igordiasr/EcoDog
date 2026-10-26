package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados de retorno de movimentacao pendente")
public record MovimentacaoPendenteResponse(
        @Schema(description = "Identificador do registro", example = "1")
        Long id,
        @Schema(description = "Data de registro", example = "2026-10-26")
        LocalDate dataRegistro,
        @Schema(description = "Nome do usuário")
        String usuario,
        @Schema(description = "Nome do pet")
        String pet,
        @Schema(description = "Serviço associado")
        String servico,
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor,
        @Schema(description = "Identificador do contrato", example = "1")
        Long idContrato
) {
}
