package br.com.ecodogpark.backend.dto.DashboardDTO.response;

public record AgendamentosPorServicoResponse(
        String servico,
        Long quantidadeAgendada
) {
}
