package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.ContratosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ContratosRepository extends JpaRepository<ContratosEntity, Long> {
    boolean existsByPetFkUsuarioIdUsuarioAndSituacaoIn(Long idUsuario, List<String> situacoes);

    @Query("""
        SELECT COUNT(c) > 0 FROM ContratosEntity c
        WHERE c.pet.idPet = :idPet
          AND c.servico.modalidade = 'PLANO'
          AND c.situacao IN ('ATIVO', 'PENDENTE')
          AND c.dataInicio <= :fim
          AND c.dataFim >= :inicio
    """)

    boolean existePlanoSobreposto(@Param("idPet") Long idPet,
                                  @Param("inicio")LocalDate inicio,
                                  @Param("fim") LocalDate fim);

    @Query("""
        SELECT c FROM ContratosEntity c
        WHERE c.pet.idPet = :idPet
          AND c.servico.modalidade = 'PLANO'
          AND c.servico.categoria = 'CRECHE'
          AND c.situacao IN('ATIVO', 'PENDENTE')
          AND :data BETWEEN c.dataInicio AND c.dataFim
    """)
    Optional<ContratosEntity> buscarPlanoVigente(@Param("idPet") Long idPet,
                                                 @Param("data") LocalDate data);

    @Query("""
        SELECT c FROM ContratosEntity c
        WHERE c.pet.idPet = :idPet
          AND c.servico.categoria = :categoria
          AND c.servico.modalidade <> 'PLANO'
          AND c.situacao IN ('PENDENTE', 'ATIVO')
          AND :data BETWEEN c.dataInicio AND c.dataFim
        ORDER BY c.dataInicio DESC
        LIMIT 1
    """)
    Optional<ContratosEntity> buscarContratoDoDia(@Param("idPet") Long idPet,
                                                  @Param("categoria") String categoria,
                                                  @Param("data") LocalDate data);

    @Query("""
        SELECT c FROM ContratosEntity c
        WHERE c.pet.idPet = :idPet
          AND c.servico.categoria = :categoria
          AND c.servico.modalidade <> 'PLANO'
          AND c.situacao IN ('PENDENTE', 'ATIVO')
          AND :data BETWEEN c.dataInicio AND c.dataFim
    """)
    List<ContratosEntity> buscarContratosPorDia(@Param("idPet") Long idPet,
                                                @Param("categoria") String categoria,
                                                @Param("data") LocalDate data);

}
