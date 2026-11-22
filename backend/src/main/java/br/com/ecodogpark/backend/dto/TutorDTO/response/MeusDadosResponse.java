package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.UUID;

public record MeusDadosResponse (
        @Schema(description = "Identificador do tutor", example = "68736f5d-7587-51fc-9101-46a148dc4852")
        UUID idTutor,
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
        @Schema(description = "Data de cadastro do tutor")
        LocalDate dataCadastro,
        @Schema(description = "Endereço do tutor")
        EnderecoResponse endereco
){
}
