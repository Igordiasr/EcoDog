package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "participacao_do_pet")
public class ParticipacaoDoPet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idParticipacaoDoPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_agendamento")
    private AgendamentosEntity fkAgendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_atividades_do_dia")
    private AtividadesDoDiaEntity fkAtividadesDoDia;

    @NotBlank
    private String situacao;
    @NotBlank
    private String observacao;
    @Positive
    private Integer grupo;

    public Long getIdParticipacaoDoPet() {
        return idParticipacaoDoPet;
    }

    public void setIdParticipacaoDoPet(Long idParticipacaoDoPet) {
        this.idParticipacaoDoPet = idParticipacaoDoPet;
    }

    public AgendamentosEntity getFkAgendamento() {
        return fkAgendamento;
    }

    public void setFkAgendamento(AgendamentosEntity fkAgendamento) {
        this.fkAgendamento = fkAgendamento;
    }

    public AtividadesDoDiaEntity getFkAtividadesDoDia() {
        return fkAtividadesDoDia;
    }

    public void setFkAtividadesDoDia(AtividadesDoDiaEntity fkAtividadesDoDia) {
        this.fkAtividadesDoDia = fkAtividadesDoDia;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Integer getGrupo() {
        return grupo;
    }

    public void setGrupo(Integer grupo) {
        this.grupo = grupo;
    }
}
