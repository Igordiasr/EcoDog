package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record DBAtividadesResponse(
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
