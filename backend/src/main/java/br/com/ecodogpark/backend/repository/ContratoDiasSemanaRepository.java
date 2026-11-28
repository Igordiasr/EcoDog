package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ContratoDiasSemanaEntity;
import br.com.ecodogpark.backend.enums.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ContratoDiasSemanaRepository extends JpaRepository<ContratoDiasSemanaEntity, Long> {
    List<ContratoDiasSemanaEntity> findByContrato_idContratoIn(List<Long> idsContratos);

    @Query("""
        SELECT cds.diaSemana
        FROM ContratoDiasSemanaEntity cds
        JOIN cds.contrato c
        WHERE c.pet.idPet = :idPet
          AND c.servico.categoria = 'CRECHE'
          AND c.situacao = 'ATIVO'
    """)
    List<DiaSemana> buscarDiasDaSemanaCrechePorPet(@Param("idPet")UUID idPet);
}
