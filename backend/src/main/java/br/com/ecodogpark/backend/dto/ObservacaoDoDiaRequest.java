package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record ObservacaoDoDiaRequest (
        @Size(max = 200)
        String observacao
){
}
