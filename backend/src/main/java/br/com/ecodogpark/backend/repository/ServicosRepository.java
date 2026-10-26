package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.ServicoAtivoResponse;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServicosRepository extends JpaRepository<ServicosEntity, Integer> {
    @Query("""
        SELECT new br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.ServicoAtivoResponse(
            s.idServico,
            s.nome,
            s.categoria,
            s.modalidade,
            s.frequencia,
            s.valor
        )
        FROM ServicosEntity s
        WHERE s.status = true
          AND s.categoria = :categoria
    """)
    List<ServicoAtivoResponse> buscarServicosAtivos(@Param("categoria") String categoria);
}
