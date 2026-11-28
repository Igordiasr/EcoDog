package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.dto.DashboardDTO.response.GraficoContratosPorServicoResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.NovosServicosMensaisResponse;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.PlanosAtivosResponse;
import br.com.ecodogpark.backend.dto.QuantidadeDiariasResponse;
import br.com.ecodogpark.backend.entity.ContratosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ContratoRepository extends JpaRepository<ContratosEntity, Long> {
    @Query("""
            SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.PlanosAtivosResponse(
                COUNT(c.situacao)
                )
            FROM ContratosEntity c
            WHERE c.situacao = 'ATIVO'
        """)
    PlanosAtivosResponse buscarPlanosAtivos();

    @Query("""
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.NovosServicosMensaisResponse(
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
    SELECT new br.com.ecodogpark.backend.dto.DashboardDTO.response.GraficoContratosPorServicoResponse(
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

    boolean existsByPetFkUsuarioIdUsuarioAndSituacaoIn(UUID idUsuario, List<String> situacoes);

    @Query("""
        SELECT c FROM ContratosEntity c
        JOIN FETCH c.pet p
        JOIN FETCH p.fkUsuario u
        JOIN FETCH c.servico s
        WHERE c.situacao = 'ATIVO'
          AND c.dataInicio <= :hoje
          AND c.dataFim >= :hoje
    """)
    List<ContratosEntity> buscarContratosParaListaClientes(@Param("hoje") LocalDate hoje);

    @Query(value = """
        SELECT new br.com.ecodogpark.backend.dto.QuantidadeDiariasResponse(
            c.idContrato AS idContrato,
            COUNT(DISTINCT a.idAgendamentos) AS quantidade
        )
        FROM ContratosEntity c
        LEFT JOIN AgendamentosEntity a
            ON a.fkPet.idPet = c.pet.idPet
            AND a.servico = c.servico.categoria
            AND CAST(a.dataEntrada as LocalDate)
                BETWEEN c.dataInicio AND c.dataFim
            AND a.situacao <> br.com.ecodogpark.backend.enums.SituacaoAgendamento.CANCELADO
        WHERE c.idContrato IN (:idsContratos)
          AND c.servico.categoria IN ('HOTEL', 'DAYUSE')
        GROUP BY c.idContrato
    """)
    List<QuantidadeDiariasResponse> contarDiariasPorContrato(
            @Param("idsContratos") List<Long> idsContratos
    );

    @Query("""
    SELECT c
    FROM ContratosEntity c
    JOIN FETCH c.pet p
    JOIN FETCH c.servico s
    WHERE p.idPet IN :idsPets
      AND c.situacao = 'ATIVO'
    ORDER BY p.nome ASC, c.dataInicio DESC
""")
    List<ContratosEntity> buscarContratosDosPetsParaGerenciamento(@Param("idsPets") List<UUID> idsPets);

    @Query("""
        SELECT COUNT(c) > 0
        FROM ContratosEntity c
        WHERE c.pet.idPet = :idPet
          AND c.servico.modalidade = 'PLANO'
          AND c.situacao IN ('ATIVO', 'PENDENTE')
""")
    boolean existePlanoAtivoOuPendente(@Param("idPet") UUID idPet);
}
