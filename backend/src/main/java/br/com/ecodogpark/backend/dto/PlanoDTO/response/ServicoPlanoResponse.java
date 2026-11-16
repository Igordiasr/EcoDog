package br.com.ecodogpark.backend.dto.PlanoDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Serviço ativo disponível para seleção em um plano")
public record ServicoPlanoResponse(
        @Schema(description = "Identificador do serviço") Integer idServico,
        @Schema(description = "Nome do serviço") String nome
) {}
