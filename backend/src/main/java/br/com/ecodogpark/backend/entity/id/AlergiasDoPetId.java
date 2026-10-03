package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record AlergiasDoPetId (
        Long fkPet,
        Integer fkAlergia
) implements Serializable {
    public AlergiasDoPetId() {
        this(null, null);
    }
}
