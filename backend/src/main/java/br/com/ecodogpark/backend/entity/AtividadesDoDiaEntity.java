package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

@Entity
@Table(name = "atividades_do_dia")
public class AtividadesDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAtividadeDoDia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_atividade")
    private AtividadesEntity fkAtividade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_calendario")
    private CalendarioEntity fkCalendario;

    @NotNull
    private LocalTime horaInicio;
    @NotNull
    private LocalTime horaFim;
    @NotNull
    private String situacao;

    public Long getIdAtividadeDoDia() {
        return idAtividadeDoDia;
    }

    public void setIdAtividadeDoDia(Long idAtividadeDoDia) {
        this.idAtividadeDoDia = idAtividadeDoDia;
    }

    public AtividadesEntity getFkAtividade() {
        return fkAtividade;
    }

    public void setFkAtividade(AtividadesEntity fkAtividade) {
        this.fkAtividade = fkAtividade;
    }

    public CalendarioEntity getFkCalendario() {
        return fkCalendario;
    }

    public void setFkCalendario(CalendarioEntity fkCalendario) {
        this.fkCalendario = fkCalendario;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFim() {
        return horaFim;
    }

    public void setHoraFim(LocalTime horaFim) {
        this.horaFim = horaFim;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }
}