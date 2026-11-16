package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Dados retornados para um plano cadastrado")
public class PlanoRespostaDTO {

    @Schema(description = "ID do plano", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long id;

    @Schema(description = "Nome do plano", example = "Hotel Premium", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nome;

    @Schema(description = "Serviço associado", example = "Hotel")
    private String nomeServico;

    @Schema(description = "ID do serviço associado", example = "1")
    private Long idServico;

    @Schema(description = "Número de diárias", example = "8", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer diarias;

    @Schema(description = "Valor do plano", example = "150.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal valor;

    @Schema(description = "Status ativo do plano", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    private Boolean ativo;

    // Construtores
    public PlanoRespostaDTO() {
    }

    public PlanoRespostaDTO(Long id, String nome, Long idServico, String nomeServico, Integer diarias, BigDecimal valor, Boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.idServico = idServico;
        this.nomeServico = nomeServico != null ? nomeServico : "";
        this.diarias = diarias;
        this.valor = valor;
        this.ativo = ativo;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getNomeServico() { return nomeServico; }
    public void setNomeServico(String nomeServico) { this.nomeServico = nomeServico; }
    public Long getIdServico() { return idServico; }
    public void setIdServico(Long idServico) { this.idServico = idServico; }
    public Integer getDiarias() { return diarias; }
    public void setDiarias(Integer diarias) { this.diarias = diarias; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
