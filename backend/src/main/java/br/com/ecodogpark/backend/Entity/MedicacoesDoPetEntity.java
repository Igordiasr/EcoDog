package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "medicacoes_do_pet")
public class MedicacoesDoPetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMedicacaoDoPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_pet")
    private PetsEntity fkPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_medicacao")
    private MedicacoesEntity fkMedicacao;

    @NotBlank
    private String frequencia;
    @NotBlank
    private String dosagem;
    @NotBlank
    private Boolean emUso;

    public Long getIdMedicacaoDoPet() {
        return idMedicacaoDoPet;
    }

    public void setIdMedicacaoDoPet(Long idMedicacaoDoPet) {
        this.idMedicacaoDoPet = idMedicacaoDoPet;
    }

    public String getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(String frequencia) {
        this.frequencia = frequencia;
    }

    public String getDosagem() {
        return dosagem;
    }

    public void setDosagem(String dosagem) {
        this.dosagem = dosagem;
    }

    public Boolean getEmUso() {
        return emUso;
    }

    public void setEmUso(Boolean emUso) {
        this.emUso = emUso;
    }

    public PetsEntity getFkPet() {
        return fkPet;
    }

    public void setFkPet(PetsEntity fkPet) {
        this.fkPet = fkPet;
    }

    public MedicacoesEntity getFkMedicacao() {
        return fkMedicacao;
    }

    public void setFkMedicacao(MedicacoesEntity fkMedicacao) {
        this.fkMedicacao = fkMedicacao;
    }
}
