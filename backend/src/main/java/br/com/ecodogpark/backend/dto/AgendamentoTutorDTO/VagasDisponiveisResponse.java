package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Capacidade e vagas disponíveis para uma categoria de serviço em uma data")
public record VagasDisponiveisResponse(
        @Schema(description = "Data de referência no formato yyyy-MM-dd", example = "2026-11-03")
        LocalDate data,
        @Schema(description = "Categoria de serviço consultada", example = "CRECHE")
        String categoriaServico,
        @Schema(description = "Capacidade total de pets para a categoria na data", example = "10")
        Integer capacidadeTotal,
        @Schema(description = "Quantidade de vagas livres na data, com valor mínimo zero", example = "5")
        Long vagasDisponiveis
) {
}
