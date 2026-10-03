package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record ObservacaoDoDiaId(
        AgendamentoId agendamentoId,
        Long idObservacao
) implements Serializable {
    public ObservacaoDoDiaId() {
        this(new AgendamentoId(), null);
    }
}
