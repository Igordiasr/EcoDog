package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Servico")
public class ServicoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServico;
    private String nome;
    private String tipo;
    private Character frequencia;
    private Double preco;
    private Boolean statusServico;

    public Integer getIdServico() {
        return idServico;
    }

    public void setIdServico(Integer idServico) {
        this.idServico = idServico;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Character getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(Character frequencia) {
        this.frequencia = frequencia;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Boolean getStatusServico() {
        return statusServico;
    }

    public void setStatusServico(Boolean statusServico) {
        this.statusServico = statusServico;
    }
}
