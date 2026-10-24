package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OrcamentoResponse(
        String servico,
        String modalidade,
        List<String> pets,
        List<LocalDate> datasUtilizacao,
        BigDecimal valorTotal
) {
}
