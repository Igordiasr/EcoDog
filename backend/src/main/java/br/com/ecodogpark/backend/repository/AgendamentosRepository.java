
package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.AgendamentosTutorResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.DiasComAgendamentoResponse;
import br.com.ecodogpark.backend.dto.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentosRepository
        extends JpaRepository<AgendamentosEntity, Long> {

    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.CheckinCheckoutResponse(
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
            a.quantidade
        )
        FROM AgendamentosEntity a
        JOIN a.fkPet p
        JOIN a.fkCalendario c
        WHERE c.data = :data
        AND a.situacao != 'Cancelado'
        ORDER BY p.nome ASC
    """)
    List<CheckinCheckoutResponse> listarPorData(
            @Param("data") LocalDate data
    );

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
    boolean petJaAgendado(@Param("idPet")Long idPet,
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
    long contarCrecheNaSemana(@Param("idPet") Long idPet,
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
    List<AgendamentosTutorResponse> buscarAgendamentosDoTutor(@Param("idUsuario") Long idUsuario,
                                                              @Param("inicio") LocalDate inicio,
                                                              @Param("fim") LocalDate fim,
                                                              @Param("situacoes") List<SituacaoAgendamento> situacoes);

    @Query("""
        SELECT COUNT(a) FROM AgendamentosEntity a
        WHERE a.fkPet.idPet = :idPet
          AND a.servico = :servico
          AND a.dataEntrada >= :inicio
          AND a.dataEntrada < :fim
          AND a.situacao IN ('AGENDADO', 'CONFIRMADO')
    """)
    List<AgendamentosEntity> buscarAtivosNoPerido(@Param("idPet") Long idPet,
                              @Param("servico") String servico,
                              @Param("inicio") LocalDateTime inicio,
                              @Param("fim") LocalDateTime fim);
}
