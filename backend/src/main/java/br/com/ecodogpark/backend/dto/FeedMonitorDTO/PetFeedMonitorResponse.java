package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Dados de retorno de pet feed monitor")
public record PetFeedMonitorResponse(
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Nome do tutor do pet", example = "Maria Silva")
        String nomeTutor,
        @Schema(description = "Observação geral do cadastro do pet")
        String observacao
//        List<String> alergias
) {
}
