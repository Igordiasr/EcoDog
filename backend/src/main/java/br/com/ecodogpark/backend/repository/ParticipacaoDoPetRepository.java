package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response.DBAtividadesResponse;
import br.com.ecodogpark.backend.dto.FeedMonitorDTO.AtividadeDoPetResponse;
import br.com.ecodogpark.backend.entity.ParticipacaoDoPetEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query(value = """
            SELECT NEW br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response.DBAtividadesResponse(
                ad.idAtividadeDoDia,
                c.data,
                a.nome,
                a.descricao,
                a.categoria,
                ad.horaInicio,
                ad.horaFim,
                ad.situacao,
                ag.idAgendamentos,
                pp.idParticipacaoDoPet,
                p.idPet,
                p.nome,
                pp.grupo
            )
            FROM
                ParticipacaoDoPetEntity pp
            JOIN
                pp.fkAgendamento ag
            JOIN
                pp.fkAtividadesDoDia ad
            JOIN
                ad.fkAtividade a
            JOIN
                ad.fkCalendario c
            JOIN
                ag.fkPet p
            WHERE c.data = :data
            ORDER BY ad.horaInicio, ad.idAtividadeDoDia, pp.grupo, p.nome ASC
            """)
    List<DBAtividadesResponse> listarAtividadesdoDia(@Param("data") LocalDate data);

    @Transactional
    @Modifying
    @Query("UPDATE ParticipacaoDoPetEntity p SET p.situacao = :situacao WHERE p.idParticipacaoDoPet IN :ids AND p.situacao = 'PENDENTE'")
    void concluirAtividadeTodosPets(@Param("situacao") String situacao, @Param("ids") List<Long> idsParticipacoes);
}
