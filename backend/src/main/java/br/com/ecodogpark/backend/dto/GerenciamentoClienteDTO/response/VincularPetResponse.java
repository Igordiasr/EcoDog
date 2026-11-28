package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Pet pertencente ao tutor selecionado")
public record VincularPetResponse(
        @Schema(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID idPet,

        @Schema(example = "Bob")
        String nome
) {}