package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "Calendario")
public class CalendarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCalendario;
    private LocalDate data;
    private Integer vagasCreche;
    private Integer vagasHotel;

    public Long getIdCalendario() {
        return idCalendario;
    }

    public void setIdCalendario(Long idCalendario) {
        this.idCalendario = idCalendario;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Integer getVagasCreche() {
        return vagasCreche;
    }

    public void setVagasCreche(Integer vagasCreche) {
        this.vagasCreche = vagasCreche;
    }

    public Integer getVagasHotel() {
        return vagasHotel;
    }

    public void setVagasHotel(Integer vagasHotel) {
        this.vagasHotel = vagasHotel;
    }
}
