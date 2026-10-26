package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Resultado da contratação de serviço ou criação de agendamentos")
public record AgendamentoCriadoResponse(
        @Schema(description = "Valor total em reais para os pets e datas selecionados", example = "300.00")
        BigDecimal valorTotal,
        @Schema(description = "Indica se a contratação ou o plano utilizado está aguardando aprovação", example = "true")
        boolean aguardandoAprovacao
) {
}
