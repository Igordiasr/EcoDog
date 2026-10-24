package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PetRepository extends JpaRepository<PetsEntity, Long> {
    List<PetsEntity> findByFkUsuario(UsuariosEntity idUsuario);
    Boolean existsByFkUsuarioAndNome(UsuariosEntity fkUsuario, String nome);
    Boolean existsByIdPetAndFkUsuario(Long idPet, UsuariosEntity fkUsuario);
}
