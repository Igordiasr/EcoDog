package br.com.ecodogpark.backend.dto.PlanoDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Dados retornados para um plano cadastrado")
public record PlanoResponse(
        @Schema(description = "Identificador do plano", example = "1") Long id,
        @Schema(description = "Nome do plano", example = "Hotel Premium") String nome,
        @Schema(description = "Identificador do serviço", example = "1") Long idServico,
        @Schema(description = "Nome do serviço associado", example = "Hotel") String nomeServico,
        @Schema(description = "Quantidade de diárias", example = "8") Integer diarias,
        @Schema(description = "Valor do plano", example = "150.00") BigDecimal valor,
        @Schema(description = "Status ativo do plano", example = "true") Boolean ativo
) {}
