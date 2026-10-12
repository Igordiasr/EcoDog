package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicacaoDoDiaRepository extends JpaRepository<MedicacaoDoDiaEntity, Long> {
    List<MedicacaoDoDiaEntity> findByFkAgendamentoFkPetIdPetAndFkAgendamentoFkCalendarioData(Long id, LocalDate data);

    Optional<MedicacaoDoDiaEntity> findByIdMedicacaoDoDiaAndFkAgendamentoFkPetIdPet(Long idMedicacao, Long idPet);
}
