package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.Entity.PetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PetRepository extends JpaRepository<PetEntity, Long> {
    boolean existsByTutorId(Long tutorId);
}
