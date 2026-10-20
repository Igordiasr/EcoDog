package br.com.ecodogpark.backend.dto.DashboardDTO.response;

public record GraficoNovosServicosResponse(
        String mesReferencia,
        Long creche,
        Long hotel,
        Long dayUse
) {
}
