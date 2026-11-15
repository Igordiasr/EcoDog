package br.com.ecodogpark.backend.entity.id;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
public record AlergiasDoPetId(
        UUID fkPet,
        Integer fkAlergia
) implements Serializable {
    public AlergiasDoPetId() {
        this(null, null);
    }
}
