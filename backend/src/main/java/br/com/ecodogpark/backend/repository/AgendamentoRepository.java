package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.AgendamentosTutorResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.DiasComAgendamentoResponse;
import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.AgendamentosPorServicoResponse;
import br.com.ecodogpark.backend.dto.DiarioPetTutor.DataAgendadaResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendamentoRepository extends JpaRepository<AgendamentosEntity, Long> {
    Optional<AgendamentosEntity> findByFkPetIdPetAndFkCalendarioDataAndSituacao(UUID idPet, LocalDate data, SituacaoAgendamento situacao);

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
        AND a.situacao != "CANCELADO"
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

    @Query(value = """
        SELECT DATE(a.data_entrada) AS data, COUNT(*) AS quantidade
        FROM agendamentos a
        WHERE (
            (:servico IN('CRECHE', 'DAYUSE') AND a.servico IN ('CRECHE', 'DAYUSE'))
            OR  
            (:servico = 'HOTEL' AND a.servico = 'HOTEL')
        )
          AND a.data_entrada >= :inicio
          AND a.data_entrada < :fim
          AND a.situacao IN ('CONFIRMADO', 'AGENDADO')
        GROUP BY DATE(a.data_entrada)
    """, nativeQuery = true)
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
          AND a.situacao IN('AGENDADO', 'CONFIRMADO')
    """)
    boolean petJaAgendado(@Param("idPet")UUID idPet,
                          @Param("inicio")LocalDateTime inicio,
                          @Param("fim")LocalDateTime fim);

    @Query("""
        SELECT COUNT(a) FROM AgendamentosEntity a
            WHERE a.fkPet.idPet = :idPet
              AND a.servico = 'CRECHE'
              AND a.dataEntrada >= :inicio
              AND a.dataEntrada < :fim
              AND a.situacao IN('AGENDADO', 'CONFIRMADO', 'RETIRADO')
    """)
    long contarCrecheNaSemana(@Param("idPet") UUID idPet,
                              @Param("inicio")LocalDateTime inicio,
                              @Param("fim") LocalDateTime fim);

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.AgendamentosTutorResponse(
            c.data, p.idPet, p.nome, a.servico, a.situacao
            )
        FROM AgendamentosEntity a
         JOIN a.fkPet p
         JOIN a.fkCalendario c
        WHERE p.fkUsuario.idUsuario = :idUsuario
          AND c.data >= :inicio
          AND c.data <= :fim
          AND a.situacao IN(:situacoes)
        ORDER BY c.data, p.nome
    """)
    List<AgendamentosTutorResponse> buscarAgendamentosDoTutor(@Param("idUsuario") UUID idUsuario,
                                                              @Param("inicio") LocalDate inicio,
                                                              @Param("fim") LocalDate fim,
                                                              @Param("situacoes") List<SituacaoAgendamento> situacoes);

    @Query("""
        SELECT a FROM AgendamentosEntity a
        WHERE a.fkPet.idPet = :idPet
          AND a.servico = :servico
          AND a.dataEntrada >= :inicio
          AND a.dataEntrada < :fim
          AND a.situacao IN ('AGENDADO', 'CONFIRMADO')
    """)
    List<AgendamentosEntity> buscarAtivosNoPerido(@Param("idPet") UUID idPet,
                                                  @Param("servico") String servico,
                                                  @Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);

    @Query(value = """
    SELECT
        c.id_contrato AS idContrato,
        COUNT(DISTINCT a.id_agendamentos) AS quantidade
    FROM contratos c
    JOIN pets p
        ON p.id_pet = c.fk_pet
    JOIN servicos s
        ON s.id_servico = c.fk_servico
    LEFT JOIN agendamentos a
        ON a.fk_pet = p.id_pet
        AND a.servico = s.categoria
        AND DATE(a.data_entrada)
            BETWEEN c.data_inicio AND c.data_fim
        AND a.situacao <> 'CANCELADO'
    WHERE c.id_contrato IN (:idsContratos)
      AND s.categoria IN ('HOTEL', 'DAYUSE')
    GROUP BY c.id_contrato
    """, nativeQuery = true)
    List<QuantidadeDiariasProjection> contarDiariasPorContrato(
            @Param("idsContratos") List<Long> idsContratos
    );

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
}
