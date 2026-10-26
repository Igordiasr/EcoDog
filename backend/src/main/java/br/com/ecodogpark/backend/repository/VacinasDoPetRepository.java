package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.VacinasDoPetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacinasDoPetRepository extends JpaRepository<VacinasDoPetEntity, Long> {
    void deleteByPet(PetsEntity pet);
}
