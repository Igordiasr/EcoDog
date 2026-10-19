
package br.com.ecodogpark.backend.dto.CheckinCheckoutDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckinCheckoutRequest(
        @NotBlank
        @Size(max = 100)
        String responsavel
) {
}
