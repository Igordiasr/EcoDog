package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AgendamentoEntity;
import br.com.ecodogpark.backend.entity.id.AgendamentoId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AgendamentoRepository extends JpaRepository<AgendamentoEntity, AgendamentoId> {
    AgendamentoEntity findByContratoPetIdPetAndCalendarioData(Long idPet, LocalDate data);
}
