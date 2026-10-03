package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Atividades")
public class AtividadeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAtividades;
    private String nome;
    private String descricao;
    private String categoria;

    public Integer getIdAtividades() {
        return idAtividades;
    }

    public void setIdAtividades(Integer idAtividades) {
        this.idAtividades = idAtividades;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
}
