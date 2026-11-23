package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AtividadesDoDiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AtividadeRepository extends JpaRepository<AtividadesDoDiaEntity, Long> {

    // Atividades (do dia) de um pet numa data exata.
    @Query("""
    SELECT ad
    FROM AtividadesDoDiaEntity ad
    JOIN ad.fkCalendario c
    WHERE c.data = :data
      AND EXISTS (
          SELECT pp.idParticipacaoDoPet
          FROM ParticipacaoDoPetEntity pp
          JOIN pp.fkAgendamento ag
          JOIN ag.fkCalendario ca
          WHERE pp.fkAtividadesDoDia = ad
            AND ag.fkPet.idPet = :idPet
            AND ca.data = :data
      )
    ORDER BY ad.horaInicio, ad.idAtividadeDoDia
    """)
    List<AtividadesDoDiaEntity> buscarPorPetEData(
            @Param("idPet") UUID idPet,
            @Param("data") LocalDate data
    );
}
