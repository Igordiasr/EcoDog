package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "vacinas_do_pet")
public class VacinasDoPetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVacinasDoPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkVacina")
    private VacinasEntity vacina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkPet")
    private PetsEntity pet;

    private LocalDate dataAplicacao;
    private LocalDate dataValidade;

    public Long getIdVacinasDoPet() {
        return idVacinasDoPet;
    }

    public void setIdVacinasDoPet(Long idVacinasDoPet) {
        this.idVacinasDoPet = idVacinasDoPet;
    }

    public PetsEntity getPet() {
        return pet;
    }

    public void setPet(PetsEntity pet) {
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
