package br.com.ecodogpark.backend.dto;

import jakarta.persistence.Id;
import jakarta.validation.constraints.*;

public record DiarioPetRequest (
        @NotBlank @Id Integer idAtividades,
        @NotBlank @Size (max = 100) String nome,
        @NotBlank Long duracao
){

}
