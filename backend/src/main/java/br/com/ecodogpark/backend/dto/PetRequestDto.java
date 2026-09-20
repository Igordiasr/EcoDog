package br.com.ecodogpark.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PetRequestDto(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 100) String raca,
        Boolean castrado,
        @NotNull Long tutorId,
        @Min(0) @Max(40) Integer idade,
        @Size(max = 100) String relacionamento,
        LocalDate vermifugo,
        LocalDate vacina,
        @Size(max = 500) String alergias,
        Character sexo,
        @Size(max = 100) String plano,
        @Size(max = 1000) String cuidadosEspeciais) {
}
