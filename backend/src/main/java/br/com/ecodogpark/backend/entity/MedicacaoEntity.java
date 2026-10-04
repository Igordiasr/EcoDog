package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Medicacao")
public class MedicacaoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMedicacao;
    private String nome;
    private String dosagem;
    private String frequencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPet")
    private PetEntity pet;

    public Long getIdMedicacao() {
        return idMedicacao;
    }

    public void setIdMedicacao(Long idMedicacao) {
        this.idMedicacao = idMedicacao;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDosagem() {
        return dosagem;
    }

    public void setDosagem(String dosagem) {
        this.dosagem = dosagem;
    }

    public String getFrequencia() {
        return frequencia;
    }

    public void setFrequencia(String frequencia) {
        this.frequencia = frequencia;
    }

    public PetEntity getPet() {
        return pet;
    }

    public void setPet(PetEntity pet) {
        this.pet = pet;
    }
}
