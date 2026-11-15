package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record   TutorCadastroResponse(
        @Schema(description = "Identificador do tutor", example = "68736f5d-7587-51fc-9101-46a148dc4852")
        UUID id,
        @Schema(description = "Nome do tutor")
        String nome,
        @Schema(description = "Sobrenome do tutor")
        String sobrenome,
        @Schema(description = "Endereço de e-mail do tutor", example = "tutor@example.com")
        String email,
        @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        String telefone
) {}