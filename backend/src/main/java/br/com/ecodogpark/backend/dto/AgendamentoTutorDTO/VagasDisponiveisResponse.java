package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import java.time.LocalDate;

public record VagasDisponiveisResponse(
        LocalDate data,
        String categoriaServico,
        Integer vagasDisponiveis
) {
}
