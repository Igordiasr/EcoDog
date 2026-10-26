package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Dados de retorno de pet para lista")
public record PetParaListaResponse(
        @Schema(description = "Identificador do pet", example = "1")
        Long idPet,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Sexo do pet", example = "M")
        String sexo,
        @Schema(description = "Indica se o pet é castrado", example = "true")
        Boolean castrado,
        @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        LocalDate dataNascimento
) {
}
