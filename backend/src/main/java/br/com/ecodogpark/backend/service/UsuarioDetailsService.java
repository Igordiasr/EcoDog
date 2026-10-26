package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.exception.UsuarioNaoEncontradoException;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        UsuariosEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));
        return User.withUsername(usuario.getEmail())
                .password(usuario.getSenha())
                .roles(usuario.getTipo())
                .disabled(!Boolean.TRUE.equals(usuario.isStatusUsuario()))
                .build();
    }
}
