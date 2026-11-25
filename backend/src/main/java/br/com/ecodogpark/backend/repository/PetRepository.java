package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.TipoUsuario;
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
    WHERE u.tipo = :tipo
      AND (
          :pesquisa IS NULL
          OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
          OR LOWER(u.nome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
          OR LOWER(u.sobrenome) LIKE LOWER(CONCAT('%', :pesquisa, '%'))
          OR LOWER(CONCAT(CONCAT(u.nome, ' '), u.sobrenome))
             LIKE LOWER(CONCAT('%', :pesquisa, '%'))
      )
    ORDER BY u.nome ASC, p.nome ASC
""")
    List<PetsEntity> buscarPetsParaGerenciamento(
            @Param("pesquisa") String pesquisa,
            @Param("tipo") TipoUsuario tipo
    );
}
