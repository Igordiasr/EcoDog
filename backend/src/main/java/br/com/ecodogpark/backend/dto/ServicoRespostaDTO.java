package br.com.ecodogpark.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Dados de um serviço disponível para seleção")
public class ServicoRespostaDTO {

    @Schema(description = "ID do serviço", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long idServico;

    @Schema(description = "Nome do serviço", example = "Hotel", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nome;

    @Schema(description = "Categoria", example = "Hospedagem")
    private String categoria;

    @Schema(description = "Modalidade", example = "Hospedagem")
    private String modalidade;

    @Schema(description = "Frequência", example = "Diária")
    private String frequencia;

    @Schema(description = "Valor do serviço", example = "50.00")
    private BigDecimal valor;

    @Schema(description = "Status do serviço", example = "true")
    private Boolean status;

    // Construtores
    public ServicoRespostaDTO() {
    }

    public ServicoRespostaDTO(Long idServico, String nome, String categoria, String modalidade, String frequencia, BigDecimal valor, Boolean status) {
        this.idServico = idServico;
        this.nome = nome;
        this.categoria = categoria;
        this.modalidade = modalidade;
        this.frequencia = frequencia;
        this.valor = valor;
        this.status = status;
    }

    // Getters e Setters
    public Long getIdServico() { return idServico; }
    public void setIdServico(Long idServico) { this.idServico = idServico; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getModalidade() { return modalidade; }
    public void setModalidade(String modalidade) { this.modalidade = modalidade; }
    public String getFrequencia() { return frequencia; }
    public void setFrequencia(String frequencia) { this.frequencia = frequencia; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
}
