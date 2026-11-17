package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados de um contrato exibido no gerenciamento de clientes")
public record GerenciamentoClienteResponse(
        @Schema(description = "Identificador do contrato", example = "1")
        Long idContrato,

        @Schema(description = "Nome do tutor", example = "Viviane")
        String tutor,

        @Schema(description = "Nome do pet", example = "Bob")
        String pet,

        @Schema(description = "Categoria do serviço", example = "Hotel")
        String servico,

        @Schema(description = "Valor do contrato", example = "100.00")
        BigDecimal valor,

        @Schema(description = "Frequência do serviço", example = "3X")
        String periodo,

        @Schema(description = "Quantidade de dias do pacote", example = "8 diárias")
        String pacote,

        @Schema(description = "Indica se o contrato está ativo", example = "true")
        Boolean ativo
) {
}