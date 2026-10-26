package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacoesDoPetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicacoesDoPetRepository extends JpaRepository<MedicacoesDoPetEntity, Long> {
}
