package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<UsuariosEntity, UUID> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    boolean existsByEmailAndIdUsuarioNot(String email, UUID id);
    boolean existsByCpfAndIdUsuarioNot(String cpf, UUID id);
    List<UsuariosEntity> findByTipo(TipoUsuario tipo);
    Optional<UsuariosEntity> findByEmail(String email);
}
