package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.CalendarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarioRepository extends JpaRepository<CalendarioEntity, Long> {
}
