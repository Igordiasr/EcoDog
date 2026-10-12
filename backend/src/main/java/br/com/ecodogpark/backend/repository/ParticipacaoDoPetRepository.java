package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.FeedMonitorDTO.AtividadeDoPetResponse;
import br.com.ecodogpark.backend.entity.ParticipacaoDoPetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ParticipacaoDoPetRepository extends JpaRepository<ParticipacaoDoPetEntity, Long> {
    List<ParticipacaoDoPetEntity> findByFkAgendamentoFkPetIdPetAndFkAgendamentoFkCalendarioData(Long id, LocalDate data);

    Optional<ParticipacaoDoPetEntity> findByIdParticipacaoDoPetAndFkAgendamentoFkPetIdPet(Long idParticipacao, Long idPet);
}
