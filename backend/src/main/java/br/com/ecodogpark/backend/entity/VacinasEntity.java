package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vacinas")
public class VacinasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVacinas;
    private String nome;
    private String tipo;

    public Integer getIdVacinas() {
        return idVacinas;
    }

    public void setIdVacinas(Integer idVacinas) {
        this.idVacinas = idVacinas;
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
}
