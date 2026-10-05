package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import br.com.ecodogpark.backend.entity.MedicacaoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MedicacaoDoDiaRepository extends JpaRepository<MedicacaoDoDiaEntity, Long> {
    List<MedicacaoDoDiaEntity> findByAgendamentoContratoPetIdPetAndAgendamentoCalendarioData(Long id, LocalDate data);
}
