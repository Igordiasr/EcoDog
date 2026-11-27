package br.com.ecodogpark.backend.dto.PlanoDTO.request;

import br.com.ecodogpark.backend.enums.CategoriaServico;
import br.com.ecodogpark.backend.enums.ModalidadeServico;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record AtualizarPlanoRequest(@NotBlank @Size(max = 100) String nome,
        @NotNull CategoriaServico categoria, @NotNull ModalidadeServico modalidade,
        @NotNull @Min(1) Integer frequencia,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal valor) {}
