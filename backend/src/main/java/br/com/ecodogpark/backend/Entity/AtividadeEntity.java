package br.com.ecodogpark.backend.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Atividades")
public class AtividadeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAtividades;
    private String nome;
    private String descricao;
    private Long duracao;

    public Integer getIdAtividades() {
        return idAtividades;
    }

    public void setIdAtividades(Integer id) {
        this.idAtividades = id;
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

    public Long getDuracao() {
        return duracao;
    }

    public void setDuracao(Long duracao) {
        this.duracao = duracao;
    }
}
