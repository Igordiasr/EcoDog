package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import java.time.LocalDate;

public record AgendamentosTutorResponse(
        LocalDate data,
        Long idPet,
        String nomePet,
        String servico,
        SituacaoAgendamento situacaoAgendamento
) {
}
