package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.AgendamentosTutorResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.DiasComAgendamentoResponse;
import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.AgendamentosPorServicoResponse;
import br.com.ecodogpark.backend.dto.DiarioPetTutor.DataAgendadaResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendamentoRepository extends JpaRepository<AgendamentosEntity, Long> {
    Optional<AgendamentosEntity> findByFkPetIdPetAndFkCalendarioDataAndSituacao(UUID idPet, LocalDate data, SituacaoAgendamento situacao);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AgendamentosEntity a WHERE a.idAgendamentos = :id")
    Optional<AgendamentosEntity> buscarPorIdParaAtualizacao(@Param("id") Long id);

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse(
            a.idAgendamentos,
            p.idPet,
            p.nome,
            a.dataEntrada,
            a.dataSaida,
            a.situacao,
            a.tutorCheckin,
            a.tutorCheckout,
            a.pertences,
            a.racaoMarca,
            a.racaoQuantidade
        )
        FROM AgendamentosEntity a
        JOIN a.fkPet p
        JOIN a.fkCalendario c
        WHERE c.data = :data
        AND a.situacao <> br.com.ecodogpark.backend.enums.SituacaoAgendamento.CANCELADO
        ORDER BY p.nome ASC
    """)
    List<CheckinCheckoutResponse> listarPorData(
            @Param("data") LocalDate data
    );

    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.AgendamentosPorServicoResponse(
                    a.servico,
                    COUNT(a.servico)
                    )
            FROM AgendamentosEntity a
            JOIN a.fkCalendario c
            WHERE c.data = :data AND a.situacao IN ('AGENDADO', 'CONFIRMADO')
            GROUP BY a.servico
        """)
    List<AgendamentosPorServicoResponse> buscarAgendamentosPorServicoParaHoje(@Param("data") LocalDate data);

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

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.DiasComAgendamentoResponse(
            CAST(a.dataEntrada AS LocalDate),
            COUNT(a)
        )
        FROM AgendamentosEntity a
        WHERE (
            (:servico IN ('CRECHE', 'DAYUSE') AND a.servico IN ('CRECHE', 'DAYUSE'))
            OR
            (:servico = 'HOTEL' AND a.servico = 'HOTEL')
        )
        AND a.dataEntrada >= :inicio
        AND a.dataEntrada < :fim
        AND a.situacao IN ( br.com.ecodogpark.backend.enums.SituacaoAgendamento.PENDENTE,
                            br.com.ecodogpark.backend.enums.SituacaoAgendamento.CONFIRMADO,
                            br.com.ecodogpark.backend.enums.SituacaoAgendamento.AGENDADO
        )
        GROUP BY CAST(a.dataEntrada AS LocalDate)
    """)
    List<DiasComAgendamentoResponse> buscarAgendamentoPorServico(
            @Param("servico") String servico,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT COUNT(a) > 0 FROM AgendamentosEntity a
        WHERE a.fkPet.idPet = :idPet
          AND a.dataEntrada >= :inicio
          AND a.dataEntrada < :fim
          AND a.situacao IN('AGENDADO', 'CONFIRMADO', 'PENDENTE')
    """)
    boolean petJaAgendado(@Param("idPet")UUID idPet,
                          @Param("inicio")LocalDateTime inicio,
                          @Param("fim")LocalDateTime fim);

    @Query("""
        SELECT a
        FROM AgendamentosEntity a
        JOIN FETCH a.fkPet p
        JOIN FETCH p.fkUsuario u
        WHERE u.idUsuario = :idTutor
          AND a.situacao = br.com.ecodogpark.backend.enums.SituacaoAgendamento.AGENDADO
        ORDER BY a.dataEntrada
    """)
    List<AgendamentosEntity> buscarAgendamentosDoTutor(@Param("idTutor") UUID idTutor);

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.DiarioPetTutor.DataAgendadaResponse(
            c.data
            )
        FROM AgendamentosEntity a
        JOIN a.fkCalendario c
        JOIN a.fkPet p
        WHERE p.idPet = :idPet
        AND c.data <= CURRENT_DATE
        AND a.situacao IN (SituacaoAgendamento.CONFIRMADO, SituacaoAgendamento.RETIRADO)
        ORDER BY c.data DESC
    """)
    List<DataAgendadaResponse> buscarDatasDeAgendamentosAnteriores(@Param("idPet") UUID idPet);

    @Query("""
        SELECT
            c.data
        FROM AgendamentosEntity a
        JOIN a.fkCalendario c
        JOIN a.fkPet p
        WHERE p.idPet = :idPet
        AND c.data <= CURRENT_DATE
        AND a.situacao IN (SituacaoAgendamento.CONFIRMADO, SituacaoAgendamento.RETIRADO)
        ORDER BY c.data DESC LIMIT 1
    """)
    LocalDate buscarUltimoAgendamento(@Param("idPet") UUID idPet);

    @Query("""
    SELECT COUNT(a)
    FROM AgendamentosEntity a
    JOIN a.fkCalendario c
    WHERE c.data = :data
      AND (
          (:servico IN ('CRECHE', 'DAYUSE')
              AND a.servico IN ('CRECHE', 'DAYUSE'))
          OR
          (:servico = 'HOTEL'
              AND a.servico = 'HOTEL')
      )
      AND a.situacao IN (
          br.com.ecodogpark.backend.enums.SituacaoAgendamento.PENDENTE,
          br.com.ecodogpark.backend.enums.SituacaoAgendamento.CONFIRMADO,
          br.com.ecodogpark.backend.enums.SituacaoAgendamento.AGENDADO
      )
""")
    long contarAgendamentosPorServicoEData(
            @Param("servico") String servico,
            @Param("data") LocalDate data
    );
}
