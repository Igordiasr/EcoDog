package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PetRequest(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 100) String raca,
        Boolean castrado,
        @NotNull Long tutorId,
        @Past LocalDate dataNascimento,
        @Size(max = 100) String relacaoComOutros,
        String sexo,
        @Size(max = 1000) String cuidadosEspeciais) {
}
