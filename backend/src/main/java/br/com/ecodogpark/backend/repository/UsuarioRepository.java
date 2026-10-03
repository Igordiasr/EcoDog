package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
    boolean existsByEmailAndIdUsuarioNot(String email, Long id);
    List<UsuarioEntity> findByNivelAcesso(Integer nivelAcesso);
}
