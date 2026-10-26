package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import java.time.LocalTime;
import java.util.List;

public record AtividadeProgramadaResponse(
        Long idAtividadeDoDia,
        String nome,
        String descricao,
        String categoria,
        LocalTime horaInicio,
        LocalTime horaFim,
        String situacao,
        List<GrupoPetsResponse> grupos
) {
}
