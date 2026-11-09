package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PetRepository extends JpaRepository<PetsEntity, UUID> {
    List<PetsEntity> findByFkUsuario(UsuariosEntity idUsuario);
    Boolean existsByFkUsuarioAndNome(UsuariosEntity fkUsuario, String nome);
    Boolean existsByIdPetAndFkUsuario(UUID idPet, UsuariosEntity fkUsuario);

    List<PetsEntity> findByFkUsuarioIdUsuario(UUID idTutor);

    List<PetsEntity> findByIdPetInAndFkUsuarioIdUsuario(List<UUID> ids, UUID idUsuario);
}
