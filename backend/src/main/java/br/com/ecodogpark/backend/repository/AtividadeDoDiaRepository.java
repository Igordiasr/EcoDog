package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AtividadesDoDiaEntity;
import br.com.ecodogpark.backend.entity.id.AtividadeDoDiaId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AtividadeDoDiaRepository extends JpaRepository<AtividadesDoDiaEntity, AtividadeDoDiaId> {
    List<AtividadesDoDiaEntity> findByAgendamentoContratoPetIdPetAndAgendamentoCalendarioData(Long idPet, LocalDate data);
}
