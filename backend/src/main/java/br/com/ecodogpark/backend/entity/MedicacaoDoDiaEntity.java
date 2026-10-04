package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Medicacao_do_dia")
public class MedicacaoDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMedicacaoDoDia;
    private Boolean status;
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "fk_contrato", referencedColumnName = "fk_contrato"),
            @JoinColumn(name = "fk_calendario", referencedColumnName = "fk_calendario")
    })
    private AgendamentoEntity agendamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_medicacao")
    private MedicacaoEntity medicacao;

    public Long getIdMedicacaoDoDia() {
        return idMedicacaoDoDia;
    }

    public void setIdMedicacaoDoDia(Long idMedicacaoDoDia) {
        this.idMedicacaoDoDia = idMedicacaoDoDia;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public AgendamentoEntity getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(AgendamentoEntity agendamento) {
        this.agendamento = agendamento;
    }

    public MedicacaoEntity getMedicacao() {
        return medicacao;
    }

    public void setMedicacao(MedicacaoEntity medicacao) {
        this.medicacao = medicacao;
    }
}
