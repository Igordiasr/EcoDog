package br.com.ecodogpark.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AlergiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAlergia;
    private String descrição;

    public Integer getIdAlergia() {
        return idAlergia;
    }

    public void setIdAlergia(Integer idAlergia) {
        this.idAlergia = idAlergia;
    }

    public String getDescrição() {
        return descrição;
    }

    public void setDescrição(String descrição) {
        this.descrição = descrição;
    }
}
