package br.com.ecodogpark.backend.dto.DashboardDTO;

public record AgendamentosPorServicoResponse(
        String servico,
        Long quantidadeAgendada
) {
}
