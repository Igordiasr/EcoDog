package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.math.BigDecimal;
import java.util.List;

public record AgendamentoCriadoResponse(
        BigDecimal valorTotal,
        boolean aprovacao
) {
}
