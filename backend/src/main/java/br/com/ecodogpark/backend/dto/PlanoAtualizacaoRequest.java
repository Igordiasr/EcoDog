package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class PlanoAtualizacaoRequest {

    @Schema(description = "Nome do plano", example = "Hotel Premium")
    private String nome;

    @Schema(description = "ID do serviço associado", example = "1")
    private Long idServico;

    @Schema(description = "Número de diárias", example = "8")
    private Integer diarias;

    @Schema(description = "Valor do plano", example = "150.00")
    private BigDecimal valor;

    @Schema(description = "Status ativo do plano", example = "true")
    private Boolean ativo;

    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getIdServico() { return idServico; }
    public void setIdServico(Long idServico) { this.idServico = idServico; }
    public Integer getDiarias() { return diarias; }
    public void setDiarias(Integer diarias) { this.diarias = diarias; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}