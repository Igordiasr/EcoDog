package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Orçamento do serviço para os pets e datas selecionados")
public record OrcamentoResponse(
        @Schema(description = "Serviço contratado ou selecionado", example = "CRECHE")
        String servico,
        @Schema(description = "Modalidade do serviço", example = "PLANO")
        String modalidade,
        @Schema(description = "Nomes dos pets selecionados", example = "[\"Thor\", \"Mel\"]")
        List<String> pets,
        @Schema(description = "Datas consideradas no cálculo do orçamento, incluindo as datas geradas para planos", example = "[\"2026-11-03\", \"2026-11-05\"]")
        List<LocalDate> datasUtilizacao,
        @Schema(description = "Valor total em reais para os pets e datas selecionados", example = "300.00")
        BigDecimal valorTotal
) {
}
