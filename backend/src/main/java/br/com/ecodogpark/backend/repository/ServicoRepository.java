package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ServicosEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<ServicosEntity, Long> {
    List<ServicosEntity> findAllByOrderByNomeAsc();
    List<ServicosEntity> findAllByStatusOrderByNomeAsc(Boolean status);
}
