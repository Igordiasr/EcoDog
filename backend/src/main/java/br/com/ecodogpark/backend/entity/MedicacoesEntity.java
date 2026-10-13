package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "medicacoes")
public class MedicacoesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMedicacoes;
    @NotBlank
    private String nome;
    private String tipo;

    public Long getIdMedicacoes() {
        return idMedicacoes;
    }

    public void setIdMedicacoes(Long idMedicacoes) {
        this.idMedicacoes = idMedicacoes;
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
