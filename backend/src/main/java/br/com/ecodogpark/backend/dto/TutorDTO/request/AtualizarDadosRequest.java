package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.br.CPF;

public record AtualizarDadosRequest(
        @Schema(description = "Nome do tutor", example = "João")
        @NotBlank @Size(max = 120)
        String nome,

        @Schema(description = "Sobrenome do tutor", example = "Silva")
        @NotBlank @Size(max = 120)
        String sobrenome,

        @Schema(description = "Documento de identidade do tutor", example = "14816546081")
        @CPF
        String cpf,

        @Schema(description = "Telefone de contato com DDD", example = "11912345678")
        @NotBlank @Pattern(regexp = "\\d{10,11}")
        String telefone,

        @Schema(description = "Endereço de e-mail do tutor", example = "tutor@example.com")
        @Email
        String email,

        @Schema(description = "Endereço do tutor")
        @NotNull @Valid
        EnderecoRequest endereco
) {
}
