package br.com.ecodogpark.backend.dto;

import java.time.LocalTime;

public record AtividadeCalendarioResponse(
        Long idAtividadeDoDia,
        Integer idAtividade,
        String nome,
        String descricao,
        String categoria,
        LocalTime horaInicio,
        LocalTime horaFim,
        String situacao
) {}
