package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PlanosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanosRepository extends JpaRepository<PlanosEntity, Long> {
    List<PlanosEntity> findAllByOrderByNomeAsc();
}
