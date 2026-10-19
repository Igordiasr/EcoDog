package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.DashboardDTO.GraficoContratosPorServicoResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.NovosServicosMensaisResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.PlanosAtivosResponse;
import br.com.ecodogpark.backend.entity.ContratosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ContratosRepository extends JpaRepository<ContratosEntity, Long> {
    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.PlanosAtivosResponse(
                COUNT(c.situacao)
                )
            FROM ContratosEntity c
            WHERE c.situacao = 'ATIVO'
        """)
    PlanosAtivosResponse buscarPlanosAtivos();

    @Query("""
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.NovosServicosMensaisResponse(
        YEAR(c.dataInicio),
        MONTH(c.dataInicio),
        SUM(CASE WHEN LOWER(s.categoria) = 'creche' THEN 1L ELSE 0L END),
        SUM(CASE WHEN LOWER(s.categoria) = 'hotel' THEN 1L ELSE 0L END),
        SUM(CASE WHEN LOWER(s.categoria) = 'dayuse' THEN 1L ELSE 0L END)
    )
    FROM ContratosEntity c
    JOIN c.servico s
    WHERE c.situacao NOT IN ('CANCELADO', 'PENDENTE')
      AND c.dataInicio >= :inicio
      AND c.dataInicio < :fim
    GROUP BY YEAR(c.dataInicio), MONTH(c.dataInicio)
    ORDER BY YEAR(c.dataInicio), MONTH(c.dataInicio)
    """)
    List<NovosServicosMensaisResponse> buscarNovosServicosPorMes(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.GraficoContratosPorServicoResponse(
        s.categoria,
        COUNT(DISTINCT p.idPet)
    )
    FROM ContratosEntity c
    JOIN c.servico s
    JOIN c.pet p
    WHERE c.situacao = 'ATIVO'
    GROUP BY s.categoria
    """)
    List<GraficoContratosPorServicoResponse> buscarContratosAtivosPorCategoria();

    @Query("""
    SELECT COUNT(p.idPet)
    FROM PetsEntity p
    WHERE NOT EXISTS (
        SELECT c.idContrato FROM ContratosEntity c
        WHERE c.pet = p AND c.situacao = 'ATIVO'
    )
    """)
    Long contarContratosInativos();
}
