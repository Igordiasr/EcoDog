package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "alergias")
public class AlergiasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAlergias;
    private String descricao;

    public Integer getIdAlergias() {
        return idAlergias;
    }

    public void setIdAlergias(Integer idAlergias) {
        this.idAlergias = idAlergias;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}
