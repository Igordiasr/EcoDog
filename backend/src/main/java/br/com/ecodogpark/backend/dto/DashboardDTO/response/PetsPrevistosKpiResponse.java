package br.com.ecodogpark.backend.dto.DashboardDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Dados de retorno para KPI pets previstos")
public record PetsPrevistosKpiResponse(
        @Schema(description = "Quantidade de agendamentos agrupada por serviço")
        List<AgendamentosPorServicoResponse> agendamentosPorServico,
        @Schema(description = "Quantidade total de vagas para o dia")
        Integer totalVagasDoDia
) {
}
