package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.entity.id.AtividadeDoDiaId;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "Atividade_do_dia")
public class AtividadeDoDiaEntity {
    @EmbeddedId
    private AtividadeDoDiaId idAtividadeDoDia = new AtividadeDoDiaId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("agendamentoId")
    @JoinColumns({
            @JoinColumn(name = "fk_contrato", referencedColumnName = "fk_contrato"),
            @JoinColumn(name = "fk_calendario", referencedColumnName = "fk_Calendario")
    })
    private AgendamentoEntity agendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkAtividade")
    @JoinColumn(name = "fk_atividade")
    private AtividadeEntity atividade;

    private Integer grupo;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private Boolean status;
    private String observacoes;

    public AtividadeDoDiaId getIdAtividadeDoDia() {
        return idAtividadeDoDia;
    }

    public void setIdAtividadeDoDia(AtividadeDoDiaId idAtividadeDoDia) {
        this.idAtividadeDoDia = idAtividadeDoDia;
    }

    public AgendamentoEntity getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(AgendamentoEntity agendamento) {
        this.agendamento = agendamento;
    }

    public AtividadeEntity getAtividade() {
        return atividade;
    }

    public void setAtividade(AtividadeEntity atividade) {
        this.atividade = atividade;
    }

    public Integer getGrupo() {
        return grupo;
    }

    public void setGrupo(Integer grupo) {
        this.grupo = grupo;
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

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}