package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de agendamentos por servico")
public record AgendamentosPorServicoResponse(
        @Schema(description = "Serviço associado")
        String servico,
        @Schema(description = "Quantidade de agendamentos do serviço", example = "1")
        Long quantidadeAgendada
) {
}
