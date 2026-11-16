package br.com.ecodogpark.backend.dto.PlanoDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@Schema(description = "Dados necessários para atualizar um plano")
public record AtualizarPlanoRequest(
        @NotBlank @Size(max = 120) @Schema(description = "Nome do plano", example = "Hotel Premium") String nome,
        @NotNull @Positive @Schema(description = "Identificador do serviço", example = "1") Long idServico,
        @NotNull @Min(1) @Schema(description = "Quantidade de diárias", example = "8") Integer diarias,
        @NotNull @DecimalMin("0.00") @Schema(description = "Valor do plano", example = "150.00") BigDecimal valor,
        @NotNull @Schema(description = "Status ativo do plano", example = "true") Boolean ativo
) {}
