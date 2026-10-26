package br.com.ecodogpark.backend.dto.DashboardDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.ContratosEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Dados de entrada para alterar movimentacao")
public record AlterarMovimentacaoRequest(
        @NotBlank
        @Schema(description = "Forma de pagamento da movimentação")
        String formaPagamento,
        @NotNull
        @Schema(description = "Data do pagamento", example = "2026-10-26")
        LocalDate dataPagamento,
        @NotNull
        @Schema(description = "Contrato associado à movimentação")
        ContratosEntity contrato
) {
}
