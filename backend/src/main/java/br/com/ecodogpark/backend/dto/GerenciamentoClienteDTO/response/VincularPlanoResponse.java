package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record VincularPlanoResponse(
        Long idContrato,
        UUID idPet,
        Integer idServico,
        LocalDate dataInicio,
        LocalDate dataFim,
        BigDecimal valor,
        String situacao
) {
}
