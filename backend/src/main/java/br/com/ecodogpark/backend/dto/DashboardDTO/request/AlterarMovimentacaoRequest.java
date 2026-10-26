package br.com.ecodogpark.backend.dto.DashboardDTO.request;

import br.com.ecodogpark.backend.entity.ContratosEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AlterarMovimentacaoRequest(
        @NotBlank
        String formaPagamento,
        @NotNull
        LocalDate dataPagamento,
        @NotNull
        ContratosEntity contrato
) {
}
