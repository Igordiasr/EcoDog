package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Dados de retorno de monitor")
public record MonitorResponse(
        @Schema(description = "Identificador do registro", example = "1")
        Long id,
        @Schema(description = "Nome do usuário")
        String nome,
        @Schema(description = "Endereço de e-mail do usuário", example = "usuario@example.com")
        String email,
        @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        String telefone,
        @Schema(description = "Data de registro", example = "2026-10-26")
        LocalDate dataRegistro
) {
}
