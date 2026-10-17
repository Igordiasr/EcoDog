package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AtividadeDoDiaQueryResponse;
import br.com.ecodogpark.backend.entity.ParticipacaoDoPetEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ParticipacaoRepository extends JpaRepository<ParticipacaoDoPetEntity, Long> {
    @Query(value = """
            SELECT NEW br.com.ecodogpark.backend.dto.AtividadeDoDiaQueryResponse(
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
    List<AtividadeDoDiaQueryResponse> listarAtividadesDoDia(@Param("data") LocalDate data);

    @Transactional
    @Modifying
    @Query("UPDATE ParticipacaoDoPetEntity p SET p.situacao = :situacao WHERE p.idParticipacaoDoPet IN :ids AND p.situacao = 'PENDENTE'")
    void concluirAtividadeTodosPets(@Param("situacao") String situacao, @Param("ids") List<Long> idsParticipacoes);
}
