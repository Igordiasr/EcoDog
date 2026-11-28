package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Schema(description = "Dados do contrato criado a partir da vinculação de um plano ao tutor")
public record VincularPlanoResponse(
        @Schema(description = "Identificador do contrato", example = "278")
        Long idContrato,

        @Schema(description = "Identificador do pet", example = "2918d4db-6978-5243-b77d-9f4aa09cfead")
        UUID idPet,

        @Schema(description = "Identificador do serviço", example = "1")
        Integer idServico,

        @Schema(description = "Data de início do contrato", example = "2027-01-07")
        LocalDate dataInicio,

        @Schema(description = "Data de término do contrato", example = "2027-01-08", nullable = true)
        LocalDate dataFim,

        @Schema(description = "Valor do contrato", example = "90.00")
        BigDecimal valor,

        @Schema(description = "Situação atual do contrato", example = "ATIVO")
        String situacao
) {
}
