package br.com.ecodogpark.backend.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Atividade_do_dia")
public class AtividadeDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAtividadeDoDia;
    private Integer grupo;
    private Boolean status;
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAgendamento")
    private AgendamentoEntity agendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAtividades")
    private AtividadeEntity atividade;

    public Long getIdAtividadeDoDia() {
        return idAtividadeDoDia;
    }

    public void setIdAtividadeDoDia(Long id) {
        this.idAtividadeDoDia = id;
    }

    public Integer getGrupo() {
        return grupo;
    }

    public void setGrupo(Integer grupo) {
        this.grupo = grupo;
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
}