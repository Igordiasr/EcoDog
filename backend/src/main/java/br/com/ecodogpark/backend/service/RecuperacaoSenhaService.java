package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.entity.RefreshTokenEntity;
import br.com.ecodogpark.backend.entity.TokenRedefinicaoSenhaEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.exception.AlgoritmoInvalidoException;
import br.com.ecodogpark.backend.exception.TokenDeRedefinicaoInvalidoException;
import br.com.ecodogpark.backend.repository.RefreshTokenRepository;
import br.com.ecodogpark.backend.repository.TokenRedefinicaoSenhaRepository;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class RecuperacaoSenhaService {
    private final UsuarioRepository usuarioRepository;
    private final TokenRedefinicaoSenhaRepository tokenRedefinicaoSenhaRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ResendEmailService resendEmailService;
    private final SecureRandom geradorAleatorio = new SecureRandom();
    private final PasswordEncoder passwordEncoder;

    public RecuperacaoSenhaService(
            UsuarioRepository usuarioRepository,
            TokenRedefinicaoSenhaRepository tokenRedefinicaoSenhaRepository,
            RefreshTokenRepository refreshTokenRepository,
            ResendEmailService resendEmailService,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRedefinicaoSenhaRepository = tokenRedefinicaoSenhaRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.resendEmailService = resendEmailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void solicitarRedefinicao(String email) {
        var usuarioEncontrado = usuarioRepository.findByEmail(email);

        if (usuarioEncontrado.isEmpty()) {
            return;
        }

        UsuariosEntity usuario = usuarioEncontrado.get();

        String token = gerarToken();
        String tokenHash = calcularHash(token);

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));

        TokenRedefinicaoSenhaEntity registro = new TokenRedefinicaoSenhaEntity();
        registro.setTokenHash(tokenHash);
        registro.setUsuario(usuario);
        registro.setCriadoEm(agora);
        registro.setExpiraEm(agora.plusMinutes(15));

        tokenRedefinicaoSenhaRepository.deleteByUsuario(usuario);
        tokenRedefinicaoSenhaRepository.save(registro);

        resendEmailService.enviarLinkRedefinicaoSenha(usuario.getEmail(), token);
    }

    @Transactional
    public void redefinirSenha(String tokenRecebido, String novaSenha) {
        String hash = calcularHash(tokenRecebido);

        TokenRedefinicaoSenhaEntity registro = tokenRedefinicaoSenhaRepository.findById(hash)
                .orElseThrow(TokenDeRedefinicaoInvalidoException::new);

        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));

        boolean jaUtilizado = registro.getUtilizadoEm() != null;
        boolean expirado = !registro.getExpiraEm().isAfter(agora);

        if (jaUtilizado || expirado) {
            throw new TokenDeRedefinicaoInvalidoException();
        }

        UsuariosEntity usuario = registro.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        List<RefreshTokenEntity> tokensDoUsuario = refreshTokenRepository.findByFkUsuario(usuario);
        for (RefreshTokenEntity token : tokensDoUsuario) {
            if (token.getRevogadoEm() == null) {
                token.setRevogadoEm(agora);
            }
        }
        refreshTokenRepository.saveAll(tokensDoUsuario);

        registro.setUtilizadoEm(agora);
        tokenRedefinicaoSenhaRepository.save(registro);
    }

    private String gerarToken() {
        byte[] bytes = new byte[32];
        geradorAleatorio.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String calcularHash(String token) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new AlgoritmoInvalidoException("SHA-256 não está disponível");
        }
    }
}
