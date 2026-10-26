package br.com.ecodogpark.backend.dto.DashboardDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.ServicosEntity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados de entrada para manipulacao meta")
public record ManipulacaoMetaRequest(
        @NotNull
        @Schema(description = "Mês de referência", example = "2026-10-26")
        LocalDate mesReferencia,
        @NotNull
        @Positive
        @Schema(description = "Valor em reais", example = "1500.00")
        BigDecimal valor,
        @NotNull
        @Schema(description = "Serviço associado")
        ServicosEntity servico
) {
}
