package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import br.com.ecodogpark.backend.entity.VacinasEntity;

import java.time.LocalDate;

@Schema(description = "Dados de entrada para cadastro vacina pet")
public record CadastroVacinaPetRequest(
        @Schema(description = "Vacina associada ao pet")
        VacinasEntity vacina,
        @Schema(description = "Data de aplicação da vacina", example = "2026-10-26")
        LocalDate dataAplicacao,
        @Schema(description = "Data de validade da vacina", example = "2026-10-26")
        LocalDate dataValidade
) {
}
