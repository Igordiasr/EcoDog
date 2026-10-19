package br.com.ecodogpark.backend.dto.DashboardDTO;

public record GraficoNovosServicosResponse(
        String mesReferencia,
        Long creche,
        Long hotel,
        Long dayUse
) {
}
