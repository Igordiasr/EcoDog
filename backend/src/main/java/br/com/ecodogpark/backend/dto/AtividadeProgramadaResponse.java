package br.com.ecodogpark.backend.dto;

import java.time.LocalTime;
import java.util.List;

public record AtividadeProgramadaResponse(
        DetalhesAtividadeResponse atividade,
        List<GrupoPetsResponse> grupos,
        LocalTime horaInicio,
        LocalTime horaFim,
        Boolean status,
        String observacoes
) {
}
