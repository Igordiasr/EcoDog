package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DiarioPetRequest (
        @NotNull(message = "O id da atividade é obrigatório") Integer idAtividades,
        @NotBlank(message = "O nome é obrigatório") @Size (max = 100) String nome,
        @NotNull(message = "A duração é obrigatória") @Positive(message = "A duração deve ser maior que zero") Long duracao
){

}