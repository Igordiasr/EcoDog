package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Dados de entrada para pet")
public record PetRequest(
        @NotBlank @Size(max = 100) @Schema(description = "Nome do pet")
        String nome,
        @Size(max = 100) @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Indica se o pet é castrado", example = "true")
        Boolean castrado,
        @NotNull @Schema(description = "Identificador do tutor", example = "1")
        Long idTutor,
        @Past @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        LocalDate dataNascimento,
        @Size(max = 100) @Schema(description = "Comportamento do pet ao interagir com outros animais")
        String relacaoComOutros,
        @Schema(description = "Sexo do pet", example = "M")
        String sexo,
        @Size(max = 1000) @Schema(description = "Cuidados especiais necessários ao pet")
        String cuidadosEspeciais
) {
}
