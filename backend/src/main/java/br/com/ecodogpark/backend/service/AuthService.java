package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.config.TokenConfig;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginResponse;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.exception.CredenciaisIncorretasException;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;
    private final UsuarioRepository usuarioRepository;

    public AuthService(AuthenticationManager authenticationManager, TokenConfig tokenConfig, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse entrar(LoginRequest dadosLogin) {
        UsernamePasswordAuthenticationToken usuarioESenha = new UsernamePasswordAuthenticationToken(dadosLogin.email(), dadosLogin.senha());
        Authentication authentication = authenticationManager.authenticate(usuarioESenha);
        UsuariosEntity usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new CredenciaisIncorretasException("Email ou senha inválidos"));
        return new LoginResponse(tokenConfig.gerarToken(usuario));
    }

}
