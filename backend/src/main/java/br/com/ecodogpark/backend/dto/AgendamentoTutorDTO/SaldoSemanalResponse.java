package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Saldo semanal de utilizações do plano de creche após os novos agendamentos")
public record SaldoSemanalResponse(
        @Schema(description = "Nome do pet", example = "Thor")
        String pet,
        @Schema(description = "Segunda-feira que inicia a semana de referência", example = "2026-11-02")
        LocalDate inicioSemana,
        @Schema(description = "Limite de utilizações do plano por semana", example = "3")
        int limite,
        @Schema(description = "Utilizações da semana incluindo os novos agendamentos", example = "2")
        long usados,
        @Schema(description = "Utilizações ainda disponíveis na semana", example = "1")
        long restantes
) {
}
