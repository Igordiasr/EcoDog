package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Pet pertencente ao tutor selecionado")
public record VincularPetResponse(

        UUID idPet,

        @Schema(example = "Bob")
        String nome
) {}