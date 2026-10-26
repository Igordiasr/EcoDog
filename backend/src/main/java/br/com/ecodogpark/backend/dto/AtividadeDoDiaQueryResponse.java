package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AtividadeDoDiaQueryResponse(
        Long idAtividadeDoDia,
        LocalDate dataAgendamento,
        String atividade,
        String descricao,
        String categoria,
        LocalTime horaInicio,
        LocalTime horaFim,
        String andamento,
        Long idAgendamento,
        Long idParticipacaoDoPet,
        Long idPet,
        String nomeDoPet,
        Integer grupo
) {
}
