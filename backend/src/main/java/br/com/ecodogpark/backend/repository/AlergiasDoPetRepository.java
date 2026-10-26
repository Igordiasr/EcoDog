package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AlergiasDoPetEntity;
import br.com.ecodogpark.backend.entity.id.AlergiasDoPetId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlergiasDoPetRepository extends JpaRepository<AlergiasDoPetEntity, AlergiasDoPetId> {
}
