package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "atividades")
public class AtividadesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAtividades;
    @NotBlank
    private String nome;
    @NotBlank
    private String descricao;
    @NotBlank
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
