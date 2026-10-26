package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacoesDoPetEntity;
import br.com.ecodogpark.backend.entity.PetsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicacoesDoPetRepository extends JpaRepository<MedicacoesDoPetEntity, Long> {
    void deleteByFkPet(PetsEntity pet);
}
