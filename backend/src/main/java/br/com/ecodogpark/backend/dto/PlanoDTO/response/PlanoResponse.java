package br.com.ecodogpark.backend.dto.PlanoDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Dados retornados para um plano cadastrado")
public record PlanoResponse(
        @Schema(description = "Identificador do plano", example = "1") Long id,
        @Schema(description = "Nome do plano", example = "Hotel Premium") String nome,
        @Schema(description = "Identificador de serviço ativo representativo da categoria do plano; a tabela servicos não guarda vínculo com o serviço de referência", example = "1") Long idServico,
        @Schema(description = "Serviço ativo representativo da categoria do plano", example = "Hotel") String nomeServico,
        @Schema(description = "Quantidade de diárias", example = "8") Integer diarias,
        @Schema(description = "Valor do plano", example = "150.00") BigDecimal valor,
        @Schema(description = "Status ativo do plano", example = "true") Boolean ativo
) {}
