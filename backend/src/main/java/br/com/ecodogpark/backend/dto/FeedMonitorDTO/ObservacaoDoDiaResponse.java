package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Dados de retorno de observacao do dia")
public record ObservacaoDoDiaResponse(
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao){
}
