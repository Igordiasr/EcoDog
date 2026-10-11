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
    private PetsEntity pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkAlergia")
    @JoinColumn(name = "fk_alergia")
    private AlergiasEntity alergia;

    private String grauSeveridade;

    public AlergiasDoPetId getIdAlergia() {
        return idAlergia;
    }

    public void setIdAlergia(AlergiasDoPetId idAlergia) {
        this.idAlergia = idAlergia;
    }

    public PetsEntity getPet() {
        return pet;
    }

    public void setPet(PetsEntity pet) {
        this.pet = pet;
    }

    public AlergiasEntity getAlergia() {
        return alergia;
    }

    public void setAlergia(AlergiasEntity alergia) {
        this.alergia = alergia;
    }

    public String getGrauSeveridade() {
        return grauSeveridade;
    }

    public void setGrauSeveridade(String grauSeveridade) {
        this.grauSeveridade = grauSeveridade;
    }
}
