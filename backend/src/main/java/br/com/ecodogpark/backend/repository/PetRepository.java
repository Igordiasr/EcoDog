package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PetRepository extends JpaRepository<PetEntity, Long> {
//    boolean existsByTutorId(Long tutorId);
}
