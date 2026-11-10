package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AlergiasEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlergiasRepository extends JpaRepository<AlergiasEntity, Integer> {
}
