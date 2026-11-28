package br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Dados de um pet e seus contratos vigentes no gerenciamento de clientes")
public record PetGerenciamentoResponse(

        @Schema(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID idPet,

        @Schema(description = "Nome do pet", example = "Bob")
        String nomePet,

        @Schema(description = "Nome completo do tutor", example = "Viviane Silva")
        String tutor,

        @Schema(description = "Quantidade de contratos vigentes do pet", example = "2")
        Integer totalContratos,

        @Schema(description = "Lista de contratos vigentes do pet")
        List<ContratoGerenciamentoResponse> contratos
) {
}
