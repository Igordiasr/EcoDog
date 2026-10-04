package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.entity.id.VacinasDoPetId;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "Vacinas_do_pet")
public class VacinasDoPetEntity {
    @EmbeddedId
    private VacinasDoPetId idVacina = new VacinasDoPetId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkPet")
    @JoinColumn(name = "fk_pet")
    private PetEntity pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkVacina")
    @JoinColumn(name = "fk_vacina")
    private VacinasEntity vacina;

    private LocalDate dataAplicacao;
    private LocalDate dataValidade;

    public VacinasDoPetId getIdVacina() {
        return idVacina;
    }

    public void setIdVacina(VacinasDoPetId idVacina) {
        this.idVacina = idVacina;
    }

    public PetEntity getPet() {
        return pet;
    }

    public void setPet(PetEntity pet) {
        this.pet = pet;
    }

    public VacinasEntity getVacina() {
        return vacina;
    }

    public void setVacina(VacinasEntity vacina) {
        this.vacina = vacina;
    }

    public LocalDate getDataAplicacao() {
        return dataAplicacao;
    }

    public void setDataAplicacao(LocalDate dataAplicacao) {
        this.dataAplicacao = dataAplicacao;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade) {
        this.dataValidade = dataValidade;
    }
}
