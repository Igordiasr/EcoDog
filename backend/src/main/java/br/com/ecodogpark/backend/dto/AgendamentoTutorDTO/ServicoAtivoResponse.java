package br.com.ecodogpark.backend.dto.AgendamentoTutorDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Serviço ativo disponível para contratação")
public record ServicoAtivoResponse(
        @Schema(description = "Identificador do serviço", example = "1")
        Integer id,
        @Schema(description = "Nome do serviço", example = "Creche semanal")
        String nome,
        @Schema(description = "Categoria do serviço", example = "CRECHE")
        String categoria,
        @Schema(description = "Modalidade do serviço", example = "PLANO")
        String modalidade,
        @Schema(description = "Frequência de utilização contratada para o serviço", example = "3 vezes por semana")
        String frequencia,
        @Schema(description = "Preço do serviço em reais", example = "150.00")
        BigDecimal valor
) {
}
