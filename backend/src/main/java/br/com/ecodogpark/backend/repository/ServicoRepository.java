package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ServicosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<ServicosEntity, Integer> {
}
