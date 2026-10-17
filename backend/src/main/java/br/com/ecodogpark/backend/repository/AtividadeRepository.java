package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AtividadesDoDiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AtividadeRepository extends JpaRepository<AtividadesDoDiaEntity, Long> {

    // Atividades (do dia) de um pet numa data exata.
    @Query(value = """
            SELECT DISTINCT ad.*
            FROM atividades_do_dia ad
            JOIN participacao_do_pet pp ON pp.fk_atividades_do_dia = ad.id_atividade_do_dia
            JOIN agendamentos ag       ON ag.id_agendamentos       = pp.fk_agendamento
            JOIN calendario c          ON c.id_calendario          = ad.fk_calendario
            WHERE ag.fk_pet = :idPet
              AND c.data = :data
            ORDER BY ad.hora_inicio, ad.id_atividade_do_dia
            """, nativeQuery = true)
    List<AtividadesDoDiaEntity> buscarPorPetEData(@Param("idPet") Long idPet,
                                                  @Param("data") LocalDate data);

    // Todas as atividades de um dia (data exata).
    @Query(value = """
            SELECT ad.*
            FROM atividades_do_dia ad
            JOIN calendario c ON c.id_calendario = ad.fk_calendario
            WHERE c.data = :data
            ORDER BY ad.hora_inicio, ad.id_atividade_do_dia
            """, nativeQuery = true)
    List<AtividadesDoDiaEntity> buscarPorData(@Param("data") LocalDate data);
}
