package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.VacinasEntity;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

@Schema(description = "Dados de entrada para cadastro vacina pet")
public record CadastroVacinaPetRequest(
        @Schema(description = "Vacina associada ao pet")
        @NotNull
        Integer idVacina,

        @Schema(description = "Data de aplicação da vacina", example = "2026-10-26")
        @NotNull @PastOrPresent
        LocalDate dataAplicacao,

        @Schema(description = "Data de validade da vacina", example = "2026-10-26")
        @NotNull @FutureOrPresent
        LocalDate dataValidade
) {
}
