package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.ServicoAtivoResponse;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ServicosRepository extends JpaRepository<ServicosEntity, Long> {
    @Query("SELECT new br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.ServicoAtivoResponse(cast(s.id as integer), s.nome, str(s.categoria), str(s.modalidade), str(s.frequencia), s.valor) FROM ServicosEntity s WHERE s.status = true AND str(s.categoria) = :categoria")
    List<ServicoAtivoResponse> buscarServicosAtivos(@Param("categoria") String categoria);

    default Optional<ServicosEntity> findById(Integer id) {
        return findById(id.longValue());
    }
}
