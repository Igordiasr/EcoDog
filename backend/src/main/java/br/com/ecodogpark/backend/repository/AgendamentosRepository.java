
package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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
}
