package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record VacinasDoPetId(
        Long fkPet,
        Integer fkVacina
) implements Serializable {
    public VacinasDoPetId() {
        this(null, null);
    }
}
