
package br.com.ecodogpark.backend.dto.CheckinCheckoutDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import java.time.LocalDateTime;

@Schema(description = "Dados de retorno de checkin checkout")
public record CheckinCheckoutResponse(
        @Schema(description = "Identificador do agendamento", example = "1")
        Long idAgendamento,
        @Schema(description = "Identificador do pet", example = "1")
        Long idPet,
        @Schema(description = "Nome do pet", example = "Thor")
        String nomePet,
        @Schema(description = "Data e horário de realização do check-in; nulo antes da entrada", example = "2026-10-26T08:00:00")
        LocalDateTime dataEntrada,
        @Schema(description = "Data e horário de realização do check-out; nulo antes da saída", example = "2026-10-26T08:00:00")
        LocalDateTime dataSaida,
        @Schema(description = "Situação atual do registro")
        SituacaoAgendamento situacao,
        @Schema(description = "Responsável registrado no check-in")
        String tutorCheckin,
        @Schema(description = "Responsável registrado no check-out")
        String tutorCheckout,
        @Schema(description = "Pertences trazidos com o pet")
        String pertences,
        @Schema(description = "Marca da ração do pet")
        String racaoMarca,
        @Schema(description = "Quantidade")
        String quantidade
) {
}
