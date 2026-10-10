package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "pets")
public class PetsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPet;
    @NotBlank
    private String nome;
    @NotBlank
    private String raca;
    @NotBlank
    @Size(min = 1, max = 1)
    private String sexo;
    @NotNull
    private Boolean castrado;
    @NotNull
    @Past
    private LocalDate dataNascimento;
    @NotBlank
    private String observacao;
    @NotBlank
    private String relacaoComOutros;
    @NotBlank
    private String veterinario;
    @NotBlank
    private String telefoneVeterinario;
    @NotNull
    private Boolean convenio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkUsuario")
    private UsuariosEntity fkUsuario;

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

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
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

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getRelacaoComOutros() {
        return relacaoComOutros;
    }

    public void setRelacaoComOutros(String relacaoComOutros) {
        this.relacaoComOutros = relacaoComOutros;
    }

    public String getVeterinario() {
        return veterinario;
    }

    public void setVeterinario(String veterinario) {
        this.veterinario = veterinario;
    }

    public String getTelefoneVeterinario() {
        return telefoneVeterinario;
    }

    public void setTelefoneVeterinario(String telefoneVeterinario) {
        this.telefoneVeterinario = telefoneVeterinario;
    }

    public Boolean getConvenio() {
        return convenio;
    }

    public void setConvenio(Boolean convenio) {
        this.convenio = convenio;
    }

    public UsuariosEntity getFkUsuario() {
        return fkUsuario;
    }

    public void setFkUsuario(UsuariosEntity fkUsuario) {
        this.fkUsuario = fkUsuario;
    }
}
