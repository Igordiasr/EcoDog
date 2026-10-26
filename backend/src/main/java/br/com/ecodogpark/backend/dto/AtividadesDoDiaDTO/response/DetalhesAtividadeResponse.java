package br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de retorno de detalhes atividade")
public record DetalhesAtividadeResponse(
        @Schema(description = "Nome da atividade")
        String nome,
        @Schema(description = "Descrição")
        String descricao,
        @Schema(description = "Categoria")
        String categoria
) {
}
