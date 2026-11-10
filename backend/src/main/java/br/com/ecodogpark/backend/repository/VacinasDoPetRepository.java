package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.VacinasDoPetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacinasDoPetRepository extends JpaRepository<VacinasDoPetEntity, Long> {
    List<VacinasDoPetEntity> findByPet(PetsEntity pet);
}
