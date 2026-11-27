package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.enums.DiaSemana;
import jakarta.persistence.*;

@Entity
@Table(name = "contrato_dias_semana")
public class ContratoDiasSemanaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contrato_dia")
    private Long idContratoDia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_contrato", referencedColumnName = "idContrato", nullable = false)
    private ContratosEntity contrato;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DiaSemana diaSemana;

    public Long getIdContratoDia() {
        return idContratoDia;
    }

    public void setIdContratoDia(Long idContratoDia) {
        this.idContratoDia = idContratoDia;
    }

    public ContratosEntity getContrato() {
        return contrato;
    }

    public void setContrato(ContratosEntity contrato) {
        this.contrato = contrato;
    }

    public DiaSemana getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(DiaSemana diaSemana) {
        this.diaSemana = diaSemana;
    }
}
