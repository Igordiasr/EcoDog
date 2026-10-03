package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record AgendamentoId (
        Long fkContrato,
        Long fkCalendario
) implements Serializable {
    public AgendamentoId() {
        this(null, null);
    }
}
