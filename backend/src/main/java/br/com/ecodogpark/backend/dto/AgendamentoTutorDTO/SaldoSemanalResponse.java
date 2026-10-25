package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.time.LocalDate;

public record SaldoSemanalResponse(
        String pet,
        LocalDate inicioSemana,
        int limite,
        long usados,
        long restantes
) {
}
