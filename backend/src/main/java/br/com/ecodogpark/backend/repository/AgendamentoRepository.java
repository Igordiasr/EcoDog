package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AgendamentoRepository extends JpaRepository<AgendamentosEntity, Long> {
    Optional<AgendamentosEntity> findByFkPetIdPetAndFkCalendarioData(Long id, LocalDate data);
}
