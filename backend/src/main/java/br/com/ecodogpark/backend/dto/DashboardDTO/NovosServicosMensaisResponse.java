package br.com.ecodogpark.backend.dto.DashboardDTO;

public record NovosServicosMensaisResponse(
        Integer ano,
        Integer mes,
        Long creche,
        Long hotel,
        Long dayUse
) {
}
