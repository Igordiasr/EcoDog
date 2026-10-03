package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.entity.id.ObservacaoDoDiaId;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "Observacao_do_dia")
public class ObservacaoDoDiaEntity {
    @EmbeddedId
    private ObservacaoDoDiaId idObservacao = new ObservacaoDoDiaId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("agendamentoId")
    @JoinColumns({
            @JoinColumn(name = "fk_contrato", referencedColumnName = "fk_contrato"),
            @JoinColumn(name = "fk_calendario", referencedColumnName = "fk_calendario")
    })
    private AgendamentoEntity agendamento;

    private String descricao;
    private LocalTime horario;


    public ObservacaoDoDiaId getIdObservacao() {
        return idObservacao;
    }

    public void setIdObservacao(ObservacaoDoDiaId idObservacao) {
        this.idObservacao = idObservacao;
    }

    public AgendamentoEntity getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(AgendamentoEntity agendamento) {
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
