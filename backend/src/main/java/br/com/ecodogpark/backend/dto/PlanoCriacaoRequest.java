package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Schema(description = "Dados necessários para criar um plano")
public class PlanoCriacaoRequest {

    @Schema(description = "Nome do plano", example = "Hotel Premium", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "O nome do plano é obrigatório")
    @Size(max = 120)
    private String nome;

    @Schema(description = "ID do serviço associado", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "O serviço é obrigatório")
    @Positive(message = "O serviço é inválido")
    private Long idServico;

    @Schema(description = "Número de diárias", example = "8", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "As diárias são obrigatórias")
    @Min(value = 1, message = "As diárias devem ser no mínimo 1")
    private Integer diarias;

    @Schema(description = "Valor do plano", example = "150.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.00", message = "O valor não pode ser negativo")
    private BigDecimal valor;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getIdServico() { return idServico; }
    public void setIdServico(Long idServico) { this.idServico = idServico; }
    public Integer getDiarias() { return diarias; }
    public void setDiarias(Integer diarias) { this.diarias = diarias; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}
