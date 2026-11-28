package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de um plano disponível para vinculação")
public record PlanoDisponivelResponse(
        @Schema(description = "Identificador do plano", example = "1")
        Integer idServico,

        @Schema(description = "Nome do plano", example = "Hotel")
        String nome,

        @Schema(description = "Categoria do serviço", example = "Hotel")
        String categoria,

        @Schema(description = "Modalidade do serviço", example = "Personalizado")
        String modalidade,

        @Schema(description = "Frequência do serviço", example = "Diário")
        String frequencia,

        @Schema(description = "Valor do plano", example = "100.00")
        BigDecimal valor
) {
}