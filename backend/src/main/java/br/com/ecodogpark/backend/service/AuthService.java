package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.config.TokenConfig;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginResponse;
import br.com.ecodogpark.backend.entity.RefreshTokenEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.exception.AlgoritmoInvalidoException;
import br.com.ecodogpark.backend.exception.CredenciaisIncorretasException;
import br.com.ecodogpark.backend.exception.UsuarioNaoAutorizadoAEntrarException;
import br.com.ecodogpark.backend.repository.RefreshTokenRepository;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;
    private final UsuarioRepository usuarioRepository;
    private final SecureRandom GERADOR_ALEATORIO = new SecureRandom();
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            TokenConfig tokenConfig,
            UsuarioRepository usuarioRepository,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public AuthSession entrar(LoginRequest dadosLogin) {
        UsernamePasswordAuthenticationToken usuarioESenha = new UsernamePasswordAuthenticationToken(dadosLogin.email(), dadosLogin.senha());
        Authentication authentication = authenticationManager.authenticate(usuarioESenha);
        UsuariosEntity usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new CredenciaisIncorretasException("Email ou senha inválidos"));

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        LocalDateTime expiraEm = agora.plusDays(7);
        String refreshToken = gerarRefreshToken();

        RefreshTokenEntity registro = new RefreshTokenEntity();
        registro.setFkUsuario(usuario);
        registro.setTokenHash(calcularHash(refreshToken));
        registro.setFamiliaId(UUID.randomUUID());
        registro.setCriadoEm(agora);
        registro.setExpiraEm(expiraEm);

        refreshTokenRepository.save(registro);

        return new AuthSession(
                tokenConfig.gerarToken(usuario),
                refreshToken,
                expiraEm
        );
    }

    @Transactional(dontRollbackOn = UsuarioNaoAutorizadoAEntrarException.class)
    public AuthSession renovar(String refreshTokenRecebido) {
        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));

        RefreshTokenEntity tokenAtual = refreshTokenRepository
                .findByTokenHash(calcularHash(refreshTokenRecebido))
                .orElseThrow(() -> new UsuarioNaoAutorizadoAEntrarException("Refresh token inválido"));

        if (tokenAtual.getUtilizadoEm() != null) {
            revogarFamilia(tokenAtual.getFamiliaId(), agora);
            throw new UsuarioNaoAutorizadoAEntrarException("Refresh token reutilizado, sessão revogada");
        }

        boolean expirado = !tokenAtual.getExpiraEm().isAfter(agora);
        boolean revogado = tokenAtual.getRevogadoEm() != null;

        if (expirado || revogado) {
            throw new UsuarioNaoAutorizadoAEntrarException("Refresh token expirado ou inválido");
        }

        tokenAtual.setUtilizadoEm(agora);
        refreshTokenRepository.save(tokenAtual);

        String novoRefreshToken = gerarRefreshToken();
        LocalDateTime novaExpiracao = agora.plusDays(7);

        RefreshTokenEntity novoRegistro = new RefreshTokenEntity();
        novoRegistro.setFkUsuario(tokenAtual.getFkUsuario());
        novoRegistro.setFamiliaId(tokenAtual.getFamiliaId());
        novoRegistro.setTokenHash(calcularHash(novoRefreshToken));
        novoRegistro.setCriadoEm(agora);
        novoRegistro.setExpiraEm(novaExpiracao);

        refreshTokenRepository.save(novoRegistro);
        return new AuthSession(
                tokenConfig.gerarToken(tokenAtual.getFkUsuario()),
                novoRefreshToken,
                novaExpiracao
        );
    }

    @Transactional
    public void sair(String refreshTokenRecebido) {
        if (refreshTokenRecebido == null || refreshTokenRecebido.isBlank()) {
            return;
        }

        var registroEncontrado = refreshTokenRepository.findByTokenHash(calcularHash(refreshTokenRecebido));

        if (registroEncontrado.isEmpty()) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));

        revogarFamilia(registroEncontrado.get().getFamiliaId(), agora);
    }

    private String gerarRefreshToken() {
        byte[] bytes = new byte[32];
        GERADOR_ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String calcularHash(String token) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new AlgoritmoInvalidoException("SHA-256 não está disponível");
        }
    }

    private void revogarFamilia(UUID familiaId, LocalDateTime agora) {
        List<RefreshTokenEntity> tokensDaFamilia = refreshTokenRepository.findByFamiliaId(familiaId);

        for (RefreshTokenEntity token : tokensDaFamilia) {
            if (token.getRevogadoEm() == null) {
                token.setRevogadoEm(agora);
            }
        }

        refreshTokenRepository.saveAll(tokensDaFamilia);
    }
}
