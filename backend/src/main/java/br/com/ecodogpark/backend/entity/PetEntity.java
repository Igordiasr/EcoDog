package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pets")
public class PetEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long idPet;
        @Column(nullable = false, length = 100)
        private String nome;
        private String raca;
        private Boolean castrado;
        private LocalDate dataNascimento;
        private String relacaoComOutros;
        private Character sexo;
        private String plano;
        @Column(length = 1000)
        private String cuidadosEspeciais;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "id_usuario", nullable = false)
        private UsuarioEntity tutor;

    public Long getIdPet() {
        return idPet;
    }

    public void setIdPet(Long idPet) {
        this.idPet = idPet;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public Boolean getCastrado() {
        return castrado;
    }

    public void setCastrado(Boolean castrado) {
        this.castrado = castrado;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getRelacaoComOutros() {
        return relacaoComOutros;
    }

    public void setRelacaoComOutros(String relacaoComOutros) {
        this.relacaoComOutros = relacaoComOutros;
    }

    public Character getSexo() {
        return sexo;
    }

    public void setSexo(Character sexo) {
        this.sexo = sexo;
    }

    public String getPlano() {
        return plano;
    }

    public void setPlano(String plano) {
        this.plano = plano;
    }

    public String getCuidadosEspeciais() {
        return cuidadosEspeciais;
    }

    public void setCuidadosEspeciais(String cuidadosEspeciais) {
        this.cuidadosEspeciais = cuidadosEspeciais;
    }

    public UsuarioEntity getTutor() {
        return tutor;
    }

    public void setTutor(UsuarioEntity tutor) {
        this.tutor = tutor;
    }
}
