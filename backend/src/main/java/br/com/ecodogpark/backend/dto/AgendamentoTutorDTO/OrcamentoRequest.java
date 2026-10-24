package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

public record OrcamentoRequest(
        Integer idServico,
        List<Long> idsPet,
        List<LocalDate> datasUtilizacao,
        LocalDate dataInicioPlano     //para plano

) {
}
