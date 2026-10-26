package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.time.LocalDate;
import java.util.List;

public record AgendamentoPlanoResponse(
        List<String> pets,
        List<LocalDate> datas,
        List<SaldoSemanalResponse> saldos,
        boolean aguardandoAprovacao
) {
}
