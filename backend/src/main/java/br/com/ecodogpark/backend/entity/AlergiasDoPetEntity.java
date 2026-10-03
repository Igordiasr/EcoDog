package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.entity.id.AlergiasDoPetId;
import jakarta.persistence.*;

@Entity
@Table(name = "Alergias_do_pet")
public class AlergiasDoPetEntity {
    @EmbeddedId
    private AlergiasDoPetId idAlergia = new AlergiasDoPetId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkPet")
    @JoinColumn(name = "fkPet")
    private PetEntity pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkAlergia")
    @JoinColumn(name = "fk_alergia")
    private AlergiaEntity alergia;

    private String grauSeveridade;

    public AlergiasDoPetId getIdAlergia() {
        return idAlergia;
    }

    public void setIdAlergia(AlergiasDoPetId idAlergia) {
        this.idAlergia = idAlergia;
    }

    public PetEntity getPet() {
        return pet;
    }

    public void setPet(PetEntity pet) {
        this.pet = pet;
    }

    public AlergiaEntity getAlergia() {
        return alergia;
    }

    public void setAlergia(AlergiaEntity alergia) {
        this.alergia = alergia;
    }

    public String getGrauSeveridade() {
        return grauSeveridade;
    }

    public void setGrauSeveridade(String grauSeveridade) {
        this.grauSeveridade = grauSeveridade;
    }
}
