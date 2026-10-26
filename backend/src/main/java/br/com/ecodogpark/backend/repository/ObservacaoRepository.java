package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ObservacaoDoDiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ObservacaoRepository extends JpaRepository<ObservacaoDoDiaEntity, Long> {

    // Observações de um pet numa data exata.
    @Query(value = """
            SELECT o.*
            FROM observacoes_do_dia o
            JOIN agendamentos ag ON ag.id_agendamentos = o.fk_agendamento
            JOIN calendario c    ON c.id_calendario    = ag.fk_calendario
            WHERE ag.fk_pet = :idPet
              AND c.data = :data
            ORDER BY o.horario, o.id_observacoes
            """, nativeQuery = true)
    List<ObservacaoDoDiaEntity> buscarPorPetEData(@Param("idPet") Long idPet,
                                                  @Param("data") LocalDate data);
}
