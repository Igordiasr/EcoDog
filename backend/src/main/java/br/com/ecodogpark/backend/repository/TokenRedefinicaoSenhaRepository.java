package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.TokenRedefinicaoSenhaEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenhaEntity, String> {
    void deleteByUsuario(UsuariosEntity usuario);
}
