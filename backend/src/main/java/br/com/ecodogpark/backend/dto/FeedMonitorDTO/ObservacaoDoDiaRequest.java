package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Size;

@Schema(description = "Dados de entrada para observacao do dia")
public record ObservacaoDoDiaRequest(
        @Size(max = 200)
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao){
}
