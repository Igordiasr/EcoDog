package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record CalendarioDiaResponse(
        Long idCalendario,
        LocalDate data,
        Integer vagasCreche,
        Integer vagasHotel,
        List<AtividadeCalendarioResponse> atividades,
        List<AlunoAgendadoResponse> alunosAgendados
) {}
