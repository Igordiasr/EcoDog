package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.enums.CategoriaServico;
import br.com.ecodogpark.backend.enums.ModalidadeServico;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.math.BigDecimal;

@Entity
@Table(name = "servicos")
public class ServicosEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    @Enumerated(EnumType.STRING)
    private CategoriaServico categoria;
    @Enumerated(EnumType.STRING)
    private ModalidadeServico modalidade;
    private Integer frequencia;
    private BigDecimal valor;
    private Boolean status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Transient
    public Integer getIdServico() {
        return id == null ? null : Math.toIntExact(id);
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    // Mantidos para os consumidores legados que ainda trabalham com textos.
    public String getCategoria() {
        return categoria == null ? null : categoria.name();
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria == null ? null : CategoriaServico.valueOf(categoria);
    }

    public CategoriaServico getCategoriaEnum() {
        return categoria;
    }

    public void setCategoriaEnum(CategoriaServico categoria) {
        this.categoria = categoria;
    }

    public String getModalidade() {
        return modalidade == null ? null : modalidade.name();
    }

    public void setModalidade(String modalidade) {
        this.modalidade = modalidade == null ? null : ModalidadeServico.valueOf(modalidade);
    }

    public ModalidadeServico getModalidadeEnum() {
        return modalidade;
    }

    public void setModalidadeEnum(ModalidadeServico modalidade) {
        this.modalidade = modalidade;
    }

    public String getFrequencia() {
        return frequencia == null ? null : frequencia.toString();
    }

    public void setFrequencia(String frequencia) {
        this.frequencia = frequencia == null ? null : Integer.valueOf(frequencia);
    }

    public Integer getFrequenciaInteger() {
        return frequencia;
    }

    public void setFrequenciaInteger(Integer frequencia) {
        this.frequencia = frequencia;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }
}
