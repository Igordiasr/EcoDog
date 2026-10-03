package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.entity.id.AgendamentoId;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Agendamento")
public class AgendamentoEntity {
    @EmbeddedId
    private AgendamentoId idAgendamento = new AgendamentoId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkContrato")
    @JoinColumn(name = "fk_contrato")
    private ContratoEntity contrato;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fkCalendario")
    @JoinColumn(name = "fk_calendario")
    private CalendarioEntity calendario;

    private LocalDateTime dataEntrada;
    private LocalDateTime dataSaida;
    private String situacao;
    private String responsavelEntrega;
    private String responsavelRetirada;

    public AgendamentoId getIdAgendamento() {
        return idAgendamento;
    }

    public void setIdAgendamento(AgendamentoId idAgendamento) {
        this.idAgendamento = idAgendamento;
    }

    public ContratoEntity getContrato() {
        return contrato;
    }

    public void setContrato(ContratoEntity contrato) {
        this.contrato = contrato;
    }

    public CalendarioEntity getCalendario() {
        return calendario;
    }

    public void setCalendario(CalendarioEntity calendario) {
        this.calendario = calendario;
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

    public String getResponsavelEntrega() {
        return responsavelEntrega;
    }

    public void setResponsavelEntrega(String responsavelEntrega) {
        this.responsavelEntrega = responsavelEntrega;
    }

    public String getResponsavelRetirada() {
        return responsavelRetirada;
    }

    public void setResponsavelRetirada(String responsavelRetirada) {
        this.responsavelRetirada = responsavelRetirada;
    }
}
