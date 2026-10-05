package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record AtividadesResponse(
        LocalDate data,
        List<AtividadeProgramadaResponse> atividadesDoDia
) {
}
