package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "Meta")
public class MetasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meta;
    private LocalDate mesReferencia;
    private Double valor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_servico")
    private ServicosEntity servico;

    public Long getMeta() {
        return meta;
    }

    public void setMeta(Long meta) {
        this.meta = meta;
    }

    public LocalDate getMesReferencia() {
        return mesReferencia;
    }

    public void setMesReferencia(LocalDate mesReferencia) {
        this.mesReferencia = mesReferencia;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public ServicosEntity getServico() {
        return servico;
    }

    public void setServico(ServicosEntity servico) {
        this.servico = servico;
    }
}
