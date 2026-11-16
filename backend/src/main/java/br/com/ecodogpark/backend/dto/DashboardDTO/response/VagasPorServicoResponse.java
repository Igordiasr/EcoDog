package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de vagas por serviço")
public record VagasPorServicoResponse(
        @Schema(description = "Categoria do serviço associado", example = "CRECHE") String servico,
        @Schema(description = "Quantidade total de vagas do mês", example = "40") Long quantidadeVagas
) {}
