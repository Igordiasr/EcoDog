package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.UsuariosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<UsuariosEntity, Long> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    boolean existsByEmailAndIdUsuarioNot(String email, Long id);
    List<UsuariosEntity> findByTipo(String tipo);
}
