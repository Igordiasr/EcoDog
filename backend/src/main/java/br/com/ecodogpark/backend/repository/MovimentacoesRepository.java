package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ContratosEntity;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MovimentacoesRepository extends JpaRepository<MovimentacoesEntity, Long> {
    Optional<MovimentacoesEntity> findByContrato(ContratosEntity contrato);
}
