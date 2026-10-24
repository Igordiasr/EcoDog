package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacoesRepository extends JpaRepository<MovimentacoesEntity, Long> {
}
