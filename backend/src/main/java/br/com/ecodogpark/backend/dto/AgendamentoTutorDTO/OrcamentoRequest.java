package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Schema(description = "Dados para calcular orçamento, contratar serviço ou agendar pelo plano")
public record OrcamentoRequest(
        @Schema(description = "Identificador do serviço ativo; utilizado no orçamento e na contratação. O agendamento pelo plano utiliza o plano vigente do pet", example = "1")
        Integer idServico,
        @Schema(description = "Identificadores dos pets do tutor. Selecione ao menos um pet", example = "[\"550e8400-e29b-41d4-a716-446655440000\", \"c7a8b2f1-9e43-4d21-8a56-123456789abc\"]")
        List<UUID> idsPet,
        @Schema(description = "Datas de utilização para serviços por dia ou agendamento pelo plano; informe ao menos uma data, sem datas passadas", example = "[\"2026-11-03\", \"2026-11-05\"]")
        List<LocalDate> datasUtilizacao,
        @Schema(description = "Data inicial para contratação de um plano; obrigatória na modalidade PLANO e não pode ser passada", example = "2026-11-03")
        LocalDate dataInicioPlano     //para plano

) {
}
