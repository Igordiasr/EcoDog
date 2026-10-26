package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Agendamentos criados com o plano e saldo semanal atualizado")
public record AgendamentoPlanoResponse(
        @Schema(description = "Nomes dos pets selecionados", example = "[\"Thor\", \"Mel\"]")
        List<String> pets,
        @Schema(description = "Datas agendadas no formato yyyy-MM-dd", example = "[\"2026-11-03\", \"2026-11-05\"]")
        List<LocalDate> datas,
        @Schema(description = "Saldos do plano por pet e semana após os agendamentos")
        List<SaldoSemanalResponse> saldos,
        @Schema(description = "Indica se a contratação ou o plano utilizado está aguardando aprovação", example = "true")
        boolean aguardandoAprovacao
) {
}
