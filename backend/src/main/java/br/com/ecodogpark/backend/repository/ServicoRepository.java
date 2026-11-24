package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ServicosEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<ServicosEntity, Integer> {
    List<ServicosEntity> findAllByStatusTrueOrderByNomeAsc();

    List<ServicosEntity> findAllByModalidadeOrderByNomeAsc(String modalidade);

    List<ServicosEntity> findAllByStatusTrueAndModalidadeNotOrderByNomeAsc(String modalidade);

    List<ServicosEntity> findAllByCategoriaAndStatusTrueAndModalidadeNotOrderByIdServicoAsc(
            String categoria, String modalidade);

    boolean existsByNomeIgnoreCaseAndCategoriaAndModalidadeAndFrequencia(
            String nome, String categoria, String modalidade, String frequencia);

    boolean existsByNomeIgnoreCaseAndCategoriaAndModalidadeAndFrequenciaAndIdServicoNot(
            String nome, String categoria, String modalidade, String frequencia, Integer idServico);
}
