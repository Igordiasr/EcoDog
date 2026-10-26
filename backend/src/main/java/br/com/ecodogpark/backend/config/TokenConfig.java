package br.com.ecodogpark.backend.config;

import br.com.ecodogpark.backend.entity.UsuariosEntity;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class TokenConfig {
    private String secret = System.getenv("JWT_SECRET");
    public String gerarToken(UsuariosEntity usuario) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withClaim("roles", usuario.getTipo())
                .withSubject(usuario.getIdUsuario().toString())
                .withExpiresAt(Instant.now().plusSeconds(600))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decode = JWT.require(algorithm)
                    .build().verify(token);
            return Optional.of(JWTUserData.builder()
                    .userId(Long.valueOf(decode.getSubject()))
                    .roles(decode.getClaim("roles").asString())
                    .build());
        } catch (JWTVerificationException exception) {
            return Optional.empty();
        }
    }
}
