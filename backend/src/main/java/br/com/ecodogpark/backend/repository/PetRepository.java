package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PetRepository extends JpaRepository<PetsEntity, UUID> {
    List<PetsEntity> findByFkUsuario(UsuariosEntity idUsuario);
    Boolean existsByFkUsuarioAndNome(UsuariosEntity fkUsuario, String nome);
    Boolean existsByIdPetAndFkUsuario(UUID idPet, UsuariosEntity fkUsuario);
    Boolean existsByFkUsuarioAndNomeAndIdPetNot(UsuariosEntity fkUsuario, String nome, UUID idPet);

    List<PetsEntity> findByFkUsuarioIdUsuario(UUID idTutor);

    List<PetsEntity> findByIdPetInAndFkUsuarioIdUsuario(List<UUID> ids, UUID idUsuario);

    @Query("""
        SELECT p
        FROM PetsEntity p
        JOIN FETCH p.fkUsuario u
        WHERE u.idUsuario IN :idsTutores
          AND u.deletado = false
          AND p.deletado = false
        ORDER BY u.nome ASC, p.nome ASC
    """)
    List<PetsEntity> buscarPetsDosTutores(@Param("idsTutores") List<UUID> idsTutores);

    @Query("""
        SELECT DISTINCT p.fkUsuario.idUsuario
        FROM PetsEntity p
        JOIN p.fkUsuario u
        WHERE u.tipo = :tipo
          AND u.deletado = false
          AND p.deletado = false
          AND (
            :pesquisa IS NULL
            OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
            OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
            OR LOWER(u.sobrenome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
            OR LOWER(CONCAT(CONCAT(u.nome, ' '), u.sobrenome)) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
          )
        ORDER BY p.fkUsuario.idUsuario
    """)
    Page<UUID> buscarIdsTutoresParaGerenciamento(@Param("pesquisa") String pesquisa,
                                                 @Param("tipo") TipoUsuario tipo,
                                                 Pageable pageable);
}
