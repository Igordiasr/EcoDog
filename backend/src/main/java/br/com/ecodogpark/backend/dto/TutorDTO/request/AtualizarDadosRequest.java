package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record AtualizarDadosRequest(
        @Schema(description = "Nome do tutor")
        String nome,
        @Schema(description = "Sobrenome do tutor")
        String sobrenome,
        @Schema(description = "Documento de identidade do tutor")
        String cpf,
        @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        String telefone,
        @Schema(description = "Endereço de e-mail do tutor", example = "usuario@example.com")
        String email,
        @Schema(description = "Endereço do tutor")
        EnderecoRequest endereco
) {
}
