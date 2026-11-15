package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ContratoDiasSemanaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContratoDiasSemanaRepository extends JpaRepository<ContratoDiasSemanaEntity, Long> {
    List<ContratoDiasSemanaEntity> findByContrato_idContratoIn(List<Long> idsContratos);
}
