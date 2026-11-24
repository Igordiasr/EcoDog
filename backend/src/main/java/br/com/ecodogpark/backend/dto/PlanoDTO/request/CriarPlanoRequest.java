package br.com.ecodogpark.backend.dto.PlanoDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Schema(description = "Dados necessários para criar um plano")
public record CriarPlanoRequest(
        @NotBlank @Size(max = 100) @Schema(description = "Nome do plano", example = "Hotel Premium") String nome,
        @NotNull @Positive @Schema(description = "Identificador de serviço ativo de referência; sua categoria define se o plano é de Creche, Hotel ou DayUse", example = "1") Long idServico,
        @NotNull @Min(1) @Max(99) @Schema(description = "Quantidade de diárias", example = "8") Integer diarias,
        @NotNull @DecimalMin("0.01") @Digits(integer = 4, fraction = 2) @Schema(description = "Valor do plano", example = "150.00") BigDecimal valor
) {}
