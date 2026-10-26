
package br.com.ecodogpark.backend.dto.CheckinCheckoutDTO;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;

import java.time.LocalDateTime;

public record CheckinCheckoutResponse(
        Long idAgendamento,
        Long idPet,
        String nomePet,
        LocalDateTime dataEntrada,
        LocalDateTime dataSaida,
        SituacaoAgendamento situacao,
        String tutorCheckin,
        String tutorCheckout,
        String pertences,
        String racaoMarca,
        String quantidade
) {
}
