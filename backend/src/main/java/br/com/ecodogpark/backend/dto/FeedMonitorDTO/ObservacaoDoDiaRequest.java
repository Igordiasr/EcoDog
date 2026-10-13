package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import jakarta.validation.constraints.Size;

public record ObservacaoDoDiaRequest (
        @Size(max = 200)
        String observacao
){
}
