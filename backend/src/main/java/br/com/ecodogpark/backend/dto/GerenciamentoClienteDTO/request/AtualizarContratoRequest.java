package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dados para atualizar um contrato")
public record AtualizarContratoRequest(
        @NotNull
        @Schema(description = "Data de início do contrato", example = "2026-11-16")
        LocalDate dataInicio,

        @NotNull
        @Schema(description = "Data de término do contrato", example = "2026-12-16")
        LocalDate dataFim,

        @NotNull
        @Positive
        @Schema(description = "Valor do contrato", example = "720.00")
        BigDecimal valor

) {
}