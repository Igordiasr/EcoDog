package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record MonitorRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @CPF @Size(max = 11) String cpf,
        @NotBlank @Size(max = 20) String telefone,
        @NotBlank @Size(min = 6, max = 255) String senha
) {
}
