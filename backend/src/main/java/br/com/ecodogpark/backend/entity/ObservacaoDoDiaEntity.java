package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "observacoes_do_dia")
public class ObservacaoDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idObservacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_agendamento")
    private AgendamentosEntity agendamento;

    private String descricao;
    private LocalTime horario;


    public Long getIdObservacoes() {
        return idObservacoes;
    }

    public void setIdObservacoes(Long idObservacoes) {
        this.idObservacoes = idObservacoes;
    }

    public AgendamentosEntity getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(AgendamentosEntity agendamento) {
        this.agendamento = agendamento;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }
}
