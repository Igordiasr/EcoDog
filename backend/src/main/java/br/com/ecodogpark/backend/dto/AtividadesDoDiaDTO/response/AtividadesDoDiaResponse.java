package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import java.time.LocalDate;
import java.util.List;

public record AtividadesDoDiaResponse(
        LocalDate data,
        List<AtividadeProgramadaResponse> atividadesDoDia
) {
}
