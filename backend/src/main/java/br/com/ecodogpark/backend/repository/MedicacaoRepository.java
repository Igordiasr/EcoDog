package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MedicacaoRepository extends JpaRepository<MedicacaoDoDiaEntity, Long> {

    // Medicações administradas a um pet numa data exata.
    @Query(value = """
            SELECT md.*
            FROM medicacao_do_dia md
            JOIN medicacoes_do_pet mp ON mp.id_medicacao_do_pet = md.fk_medicacao_do_pet
            JOIN agendamentos ag      ON ag.id_agendamentos     = md.fk_agendamento
            JOIN calendario c         ON c.id_calendario        = ag.fk_calendario
            JOIN medicacoes m         ON m.id_medicacoes        = mp.fk_medicacao
            WHERE mp.fk_pet = :idPet
              AND ag.fk_pet = :idPet
              AND c.data = :data
            ORDER BY m.nome, md.id_medicacao_do_dia
            """, nativeQuery = true)
    List<MedicacaoDoDiaEntity> buscarPorPetEData(@Param("idPet") Long idPet,
                                                 @Param("data") LocalDate data);
}
