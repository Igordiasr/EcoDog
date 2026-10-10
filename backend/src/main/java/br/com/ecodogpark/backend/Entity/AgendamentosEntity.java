package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "agendamentos")
public class AgendamentosEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAgendamentos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkPet")
    private PetsEntity fkPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkCalendario")
    private CalendarioEntity fkCalendario;

    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private String situacao;
    private String tutorCheckin;
    private String tutorCheckout;
    private String pertences;
    private String racaoMarca;
    private String quantidade;

    public Long getIdAgendamentos() {
        return idAgendamentos;
    }

    public void setIdAgendamentos(Long idAgendamentos) {
        this.idAgendamentos = idAgendamentos;
    }

    public PetsEntity getFkPet() {
        return fkPet;
    }

    public void setFkPet(PetsEntity fkPet) {
        this.fkPet = fkPet;
    }

    public CalendarioEntity getFkCalendario() {
        return fkCalendario;
    }

    public void setFkCalendario(CalendarioEntity fkCalendario) {
        this.fkCalendario = fkCalendario;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDateTime dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public LocalDateTime getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(LocalDateTime dataSaida) {
        this.dataSaida = dataSaida;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public String getTutorCheckin() {
        return tutorCheckin;
    }

    public void setTutorCheckin(String tutorCheckin) {
        this.tutorCheckin = tutorCheckin;
    }

    public String getTutorCheckout() {
        return tutorCheckout;
    }

    public void setTutorCheckout(String tutorCheckout) {
        this.tutorCheckout = tutorCheckout;
    }

    public String getPertences() {
        return pertences;
    }

    public void setPertences(String pertences) {
        this.pertences = pertences;
    }

    public String getRacaoMarca() {
        return racaoMarca;
    }

    public void setRacaoMarca(String racaoMarca) {
        this.racaoMarca = racaoMarca;
    }

    public String getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(String quantidade) {
        this.quantidade = quantidade;
    }
}
