package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "medicacao_do_dia")
public class MedicacaoDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMedicacaoDoDia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkMedicacaoDoPet")
    private MedicacoesDoPetEntity fkMedicacaoDoPet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fkAgendamento")
    private AgendamentosEntity fkAgendamento;

    @NotBlank
    private String situacao;
    @NotBlank
    private String observacao;

    public Long getIdMedicacaoDoDia() {
        return idMedicacaoDoDia;
    }

    public void setIdMedicacaoDoDia(Long idMedicacaoDoDia) {
        this.idMedicacaoDoDia = idMedicacaoDoDia;
    }

    public MedicacoesDoPetEntity getFkMedicacaoDoPet() {
        return fkMedicacaoDoPet;
    }

    public void setFkMedicacaoDoPet(MedicacoesDoPetEntity fkMedicacaoDoPet) {
        this.fkMedicacaoDoPet = fkMedicacaoDoPet;
    }

    public AgendamentosEntity getFkAgendamento() {
        return fkAgendamento;
    }

    public void setFkAgendamento(AgendamentosEntity fkAgendamento) {
        this.fkAgendamento = fkAgendamento;
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
}
