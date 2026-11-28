package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Schema(description = "Dados para atualizar um contrato")
public record AtualizarValorContratoRequest(

        @NotNull
        @Positive
        @Schema(description = "Novo valor do contrato", example = "350.00")
        BigDecimal valor

) {
}