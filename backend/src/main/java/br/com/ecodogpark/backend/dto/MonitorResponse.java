package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;

public record MonitorResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        LocalDate dataRegistro
) {
}
