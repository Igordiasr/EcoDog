package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Tutor disponível para vinculação de contrato")
public record TutorDisponivelResponse(

        @Schema(description = "Identificador do tutor")
        UUID idTutor,

        @Schema(description = "Nome do tutor")
        String nome,

        @Schema(description = "Sobrenome do tutor")
        String sobrenome
) {}