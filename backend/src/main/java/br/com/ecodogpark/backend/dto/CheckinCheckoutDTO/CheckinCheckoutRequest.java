
package br.com.ecodogpark.backend.dto.CheckinCheckoutDTO;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados de entrada para checkin checkout")
public record CheckinCheckoutRequest(
        @NotBlank
        @Size(max = 100)
        @Schema(description = "Nome da pessoa responsável pela entrada ou saída do pet", example = "Maria Silva")
        String responsavel
) {
}
