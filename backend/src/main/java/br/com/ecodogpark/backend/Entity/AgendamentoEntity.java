package br.com.ecodogpark.backend.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Agendamento")
public class AgendamentoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAgendamento;
    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private String situacao;
    private String obsRetirada;

    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL,  orphanRemoval = true)
    private List<AtividadeDoDiaEntity> atividades = new ArrayList<>();

    @OneToMany(mappedBy = "agendamento", cascade =  CascadeType.ALL, orphanRemoval = true)
    private List<MedicacaoDoDiaEntity> medicacoes = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idContrato")
    private ContratoEntity contrato;

    public Long getIdAgendamento() {
        return idAgendamento;
    }

    public void setIdAgendamento(Long idAgendamento) {
        this.idAgendamento = idAgendamento;
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

    public String getObsRetirada() {
        return obsRetirada;
    }

    public void setObsRetirada(String obsRetirada) {
        this.obsRetirada = obsRetirada;
    }

    public List<AtividadeDoDiaEntity> getAtividades() {
        return atividades;
    }

    public void setAtividades(List<AtividadeDoDiaEntity> atividades) {
        this.atividades = atividades;
    }

    public List<MedicacaoDoDiaEntity> getMedicacoes() {
        return medicacoes;
    }

    public void setMedicacoes(List<MedicacaoDoDiaEntity> medicacoes) {
        this.medicacoes = medicacoes;
    }

    public ContratoEntity getContrato() {
        return contrato;
    }

    public void setContrato(ContratoEntity contrato) {
        this.contrato = contrato;
    }
}
