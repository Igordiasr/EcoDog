package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import java.time.LocalDate;

@Schema(description = "Agendamento de um pet do tutor no mês consultado")
public record AgendamentosTutorResponse(
        @Schema(description = "Data de referência no formato yyyy-MM-dd", example = "2026-11-03")
        LocalDate data,
        @Schema(description = "Identificador do pet", example = "9")
        Long idPet,
        @Schema(description = "Nome do pet", example = "Thor")
        String nomePet,
        @Schema(description = "Serviço contratado ou selecionado", example = "CRECHE")
        String servico,
        @Schema(description = "Situação atual do agendamento", example = "AGENDADO")
        SituacaoAgendamento situacaoAgendamento
) {
}
