package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.FeedMonitorDTO.AtividadeDoPetResponse;
import br.com.ecodogpark.backend.entity.ParticipacaoDoPetEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ParticipacaoDoPetRepository extends JpaRepository<ParticipacaoDoPetEntity, Long> {
    boolean existsByFkAtividadesDoDiaIdAtividadeDoDia(Long idAtividadeDoDia);

    @Query("""
        SELECT p FROM ParticipacaoDoPetEntity p
            WHERE p.fkAgendamento.fkPet.idPet = :idPet
              AND p.fkAgendamento.fkCalendario.data = :data
              AND p.fkAgendamento.situacao = :situacao
    """)
    List<ParticipacaoDoPetEntity> buscarAtividadeDoPetAgendadoEConfirmado(Long idPet, LocalDate data, SituacaoAgendamento situacao);

    @Query("""
        SELECT p FROM ParticipacaoDoPetEntity p
            WHERE p.idParticipacaoDoPet = :idParticipacao
              AND p.fkAgendamento.fkPet.idPet = :idPet
              AND p.fkAgendamento.fkCalendario.data = :data
              AND p.fkAgendamento.situacao = :situacao
    """)
    Optional<ParticipacaoDoPetEntity> buscarAtividadeDoPetNoAgendamento(Long idParticipacao,
                                                                        Long idPet,
                                                                        LocalDate data,
                                                                        SituacaoAgendamento situacao);
}
