package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados de um contrato exibido no gerenciamento de clientes")
public record ContratoGerenciamentoResponse(

        @Schema(description = "Identificador do contrato")
        Long idContrato,

        @Schema(description = "Categoria do serviço", example = "HOTEL")
        String servico,

        @Schema(description = "Valor contratado", example = "350.00")
        BigDecimal valor,

        @Schema(description = "Modalidade do serviço", example = "DIARIA")
        String modalidade,

        @Schema(description = "Frequência do serviço", example = "3")
        String frequencia,

        @Schema(description = "Data de início")
        LocalDate dataInicio,

        @Schema(description = "Data de término")
        LocalDate dataFim,

        @Schema(description = "Quantidade de diárias; nulo para creche")
        Long quantidadeDiarias,

        @Schema(description = "Dias da semana vinculados ao contrato")
        List<String> diasSemana,

        @Schema(description = "Situação atual")
        String situacao
) {
}
