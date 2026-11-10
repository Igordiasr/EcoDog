package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.VacinasEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacinasRepository extends JpaRepository<VacinasEntity, Integer> {
}
