package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AgendamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<AgendamentoEntity, Long> {
}
