package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AgendamentoRepository extends JpaRepository<AgendamentosEntity, Long> {
    Optional<AgendamentosEntity> findByFkPetIdPetAndFkCalendarioDataAndSituacao(Long id, LocalDate data, SituacaoAgendamento situacao);

    @Query("""
        SELECT a
        FROM AgendamentosEntity a
        JOIN FETCH a.fkPet p
        JOIN FETCH p.fkUsuario u
        JOIN FETCH a.fkCalendario c
        WHERE c.data = :data
        AND a.situacao <> SituacaoAgendamento.CANCELADO
        ORDER BY p.nome ASC
    """)
    List<AgendamentosEntity> listarAgendamentosDoDia(@Param("data") LocalDate data);
}
