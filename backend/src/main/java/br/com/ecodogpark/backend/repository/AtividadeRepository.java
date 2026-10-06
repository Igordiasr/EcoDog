package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.Entity.AtividadeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtividadeRepository extends JpaRepository<AtividadeEntity, Integer> {
}
