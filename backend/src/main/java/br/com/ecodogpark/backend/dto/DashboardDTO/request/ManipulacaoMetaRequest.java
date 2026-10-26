package br.com.ecodogpark.backend.dto.DashboardDTO.request;

import br.com.ecodogpark.backend.entity.ServicosEntity;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ManipulacaoMetaRequest(
        @NotNull
        LocalDate mesReferencia,
        @NotNull
        @Positive
        BigDecimal valor,
        @NotNull
        ServicosEntity servico
) {
}
