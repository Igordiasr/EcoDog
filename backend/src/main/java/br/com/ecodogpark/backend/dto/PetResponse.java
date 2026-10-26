package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Dados de retorno de pet")
public record PetResponse(
        @Schema(description = "Identificador do registro", example = "1")
        Long id,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Indica se o pet é castrado", example = "true")
        Boolean castrado,
        @Schema(description = "Identificador do tutor", example = "1")
        Long idTutor,
        @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        LocalDate dataNascimento,
        @Schema(description = "Comportamento do pet ao interagir com outros animais")
        String relacaoComOutros,
        @Schema(description = "Sexo do pet", example = "M")
        String sexo,
        @Schema(description = "Cuidados especiais necessários ao pet")
        String cuidadosEspeciais
) {
}
