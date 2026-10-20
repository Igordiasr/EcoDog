package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.AgendamentosPorServicoResponse;
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
            a.quantidade
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
}
