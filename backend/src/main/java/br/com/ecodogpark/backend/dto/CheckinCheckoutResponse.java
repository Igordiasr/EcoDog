
package br.com.ecodogpark.backend.dto;

import java.time.LocalDateTime;

public record CheckinCheckoutResponse(
        Long idAgendamento,
        Long idPet,
        String nomePet,
        LocalDateTime dataEntrada,
        LocalDateTime dataSaida,
        String situacao,
        String tutorCheckin,
        String tutorCheckout,
        String pertences,
        String racaoMarca,
        String quantidade
) {
}
