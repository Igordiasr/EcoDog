package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request;

import br.com.ecodogpark.backend.enums.DiaSemana;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Schema(description = "Dados para vincular um serviço ao contrato")
public record VincularPlanoRequest(
        @NotNull
        @Schema(description = "Identificador do tutor")
        UUID idTutor,

        @NotNull
        @Schema(description = "Identificador do pet pertencente ao tutor")
        UUID idPet,

        @NotNull
        @Positive
        @Schema(description = "Identificador do serviço ativo", example = "2")
        Integer idServico,

        @NotNull
        @Positive
        @Schema(description = "Valor acordado para o contrato", example = "350.00")
        BigDecimal valor,

        @Schema(
                description = "Dias da semana. Obrigatório para CRECHE.",
                example = "[\"SEGUNDA\", \"QUARTA\", \"SEXTA\"]"
        )
        List<DiaSemana> diasSemana,

        @NotNull
        @Schema(description = "Data de início do contrato",
                example = "2026-11-24"
        )
        LocalDate dataInicio,

        @NotNull
        @Schema(description = "Data de fim do contrato", example = "2026-11-26")
        LocalDate dataFim,

        @NotBlank
        @Pattern(regexp = "ATIVO|PENDENTE|CANCELADO|ENCERRADO",
                message = "Situação inválida"
        )
        @Schema(description = "Situação inicial do contrato",
                allowableValues = {"ATIVO", "PENDENTE", "CANCELADO", "ENCERRADO"},
                example = "ATIVO"
        )
        String situacao

) {
}