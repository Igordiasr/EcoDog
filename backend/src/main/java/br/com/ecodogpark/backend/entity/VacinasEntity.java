package br.com.ecodogpark.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class VacinasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idVacinas;
    private String tipo;
    private String nome;

    public Integer getIdVacinas() {
        return idVacinas;
    }

    public void setIdVacinas(Integer idVacinas) {
        this.idVacinas = idVacinas;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
