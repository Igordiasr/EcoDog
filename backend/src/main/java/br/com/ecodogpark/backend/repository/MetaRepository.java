package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.DashboardDTO.response.MetasServicosResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.ValorPorServicoResponse;
import br.com.ecodogpark.backend.entity.MetasEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MetaRepository extends JpaRepository<MetasEntity, Long> {
    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.ValorPorServicoResponse(
                    s.categoria,
                    SUM(me.valor)
                    )
            FROM MetasEntity me
            JOIN me.servico s
            WHERE me.mesReferencia >= :inicio AND me.mesReferencia < :proximoMes
            GROUP BY s.categoria
        """)
    List<ValorPorServicoResponse> buscarMetasPorServico(@Param("inicio") LocalDate inicio, @Param("proximoMes") LocalDate proximoMes);

    @Query("""
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.MetasServicosResponse(
            YEAR(m.mesReferencia),
            MONTH(m.mesReferencia),
            SUM(m.valor)
            )
    FROM MetasEntity m
    WHERE m.mesReferencia >= :inicio
      AND m.mesReferencia < :fim
    GROUP BY
        YEAR(m.mesReferencia),
        MONTH(m.mesReferencia)
    ORDER BY
        YEAR(m.mesReferencia),
        MONTH(m.mesReferencia)
    """)
    List<MetasServicosResponse> buscarReceitasPrevistas(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    @Query("""
            SELECT m, s FROM MetasEntity m JOIN m.servico s WHERE m.mesReferencia = :mesReferencia AND s.categoria =:servico
        """)
    List<MetasEntity> buscarMetaPorMesEServico(@Param("mesReferencia") LocalDate mesReferencia, @Param("servico") String servico);
}
