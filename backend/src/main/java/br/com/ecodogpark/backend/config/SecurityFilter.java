package br.com.ecodogpark.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenConfig tokenConfig;

    public SecurityFilter(TokenConfig tokenConfig) {
        this.tokenConfig = tokenConfig;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest requisicao,
            HttpServletResponse resposta,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String cabecalhoAutorizado = requisicao.getHeader("Authorization");
        if (cabecalhoAutorizado != null && cabecalhoAutorizado.startsWith("Bearer ")) {
            String token = cabecalhoAutorizado.substring("Bearer ".length());
            Optional<JWTUserData> optUsuario = tokenConfig.validarToken(token);
            if (optUsuario.isPresent()) {
                JWTUserData userData = optUsuario.get();
                var permissoes = List.of(new SimpleGrantedAuthority("ROLE_" + userData.roles()));
                UsernamePasswordAuthenticationToken autenticacao = new UsernamePasswordAuthenticationToken(
                        userData, null, permissoes
                );
                SecurityContextHolder.getContext().setAuthentication(autenticacao);
            }
            filterChain.doFilter(requisicao, resposta);
        } else {
            filterChain.doFilter(requisicao, resposta);
        }
    }
}
