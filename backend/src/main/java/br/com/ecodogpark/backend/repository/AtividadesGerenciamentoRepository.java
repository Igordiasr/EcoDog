package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.AtividadesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AtividadesGerenciamentoRepository extends JpaRepository<AtividadesEntity, Integer> {
    List<AtividadesEntity> findAllByOrderByNomeAsc();
}
