package br.com.ecodogpark.backend.Entity;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
public class ObservacaoDoDiaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idObservacaoDoDia;
    private String descricao;
    private LocalTime horario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAgendamento")
    private AgendamentoEntity agendamento;
}
