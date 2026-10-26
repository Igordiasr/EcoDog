package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.DashboardDTO.response.MetasServicosResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.MovimentacaoPendenteResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.UltimasMovimentacoesResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.ValorPorServicoResponse;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MovimentacoesRepository extends JpaRepository<MovimentacoesEntity, Long> {
    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.UltimasMovimentacoesResponse(
                    m.dataPagamento,
                    s.nome,
                    p.nome,
                    m.valor
                    )
            FROM MovimentacoesEntity m
            JOIN m.contrato c
            JOIN c.servico s
            JOIN c.pet p
            WHERE m.situacao = 'PAGO'
            ORDER BY m.dataPagamento DESC LIMIT 3
        """)
    List<UltimasMovimentacoesResponse> buscarUltimasMovimentacoes();

    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.MovimentacaoPendenteResponse(
                    m.idMovimentacoes,
                    m.dataRegistro,
                    u.nome,
                    p.nome,
                    s.nome,
                    m.valor,
                    c.idContrato
                    )
            FROM MovimentacoesEntity m
            JOIN m.contrato c
            JOIN c.servico s
            JOIN c.pet p
            JOIN p.fkUsuario u
            WHERE m.situacao = 'PENDENTE'
            ORDER BY m.dataRegistro
        """)
    List<MovimentacaoPendenteResponse> buscarMovimentacoesPendentes();

    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.ValorPorServicoResponse(
                    s.categoria,
                    SUM(m.valor)
                    )
            FROM MovimentacoesEntity m
            JOIN m.contrato c
            JOIN c.servico s
            WHERE m.situacao = 'PAGO' AND m.dataPagamento >= :inicio AND m.dataPagamento <= :fim
            GROUP BY s.categoria
        """)
    List<ValorPorServicoResponse> buscarTotalRecebidoPorServico(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("""
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.MetasServicosResponse(
            YEAR(m.dataPagamento),
            MONTH(m.dataPagamento),
            SUM(m.valor)
            )
    FROM MovimentacoesEntity m
    WHERE m.situacao = 'PAGO'
      AND m.dataPagamento >= :inicio
      AND m.dataPagamento < :fim
    GROUP BY
        YEAR(m.dataPagamento),
        MONTH(m.dataPagamento)
    ORDER BY
        YEAR(m.dataPagamento),
        MONTH(m.dataPagamento)
    """)
    List<MetasServicosResponse> buscarReceitasRecebidasUltimosMeses(
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );
}
