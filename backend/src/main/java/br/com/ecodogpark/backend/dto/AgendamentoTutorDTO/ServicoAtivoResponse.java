package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.math.BigDecimal;

public record ServicoAtivoResponse(
        Integer id,
        String nome,
        String categoria,
        String modalidade,
        String frequencia,
        BigDecimal valor
) {
}
