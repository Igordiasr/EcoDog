package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record AtividadeDoDiaId (
        AgendamentoId agendamentoId,
        Integer fkAtividade
) implements Serializable {
    public AtividadeDoDiaId() {
        this(new AgendamentoId(), null);
    }
}
