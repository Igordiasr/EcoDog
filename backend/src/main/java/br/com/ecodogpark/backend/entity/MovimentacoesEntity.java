package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacoes")
public class MovimentacoesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMovimentacoes;
    private BigDecimal valor;
    private LocalDate dataRegistro;
    private String situacao;
    private String formaPagamento;
    private LocalDate dataPagamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_contrato")
    private ContratosEntity contrato;

    public Long getIdMovimentacoes() {
        return idMovimentacoes;
    }

    public void setIdMovimentacoes(Long idMovimentacoes) {
        this.idMovimentacoes = idMovimentacoes;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDate getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(LocalDate dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public ContratosEntity getContrato() {
        return contrato;
    }

    public void setContrato(ContratosEntity contrato) {
        this.contrato = contrato;
    }
}
