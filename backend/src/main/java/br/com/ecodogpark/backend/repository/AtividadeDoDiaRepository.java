package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.Entity.AtividadeDoDiaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtividadeDoDiaRepository extends JpaRepository<AtividadeDoDiaEntity, Long> {
    List<AtividadeDoDiaEntity> findByAgendamentoContratoPetIdPet(Long idPet);
}
