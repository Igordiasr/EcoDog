package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroTutorRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.TutorCadastroResponse;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginResponse;
import br.com.ecodogpark.backend.exception.UsuarioNaoAutorizadoAEntrarException;
import br.com.ecodogpark.backend.service.AuthService;
import br.com.ecodogpark.backend.service.AuthSession;
import br.com.ecodogpark.backend.service.TutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
    private final AuthService authService;
    private final TutorService tutorService;

    public AuthController(AuthService authService, TutorService tutorService) {
        this.authService = authService;
        this.tutorService = tutorService;
    }

    @Operation(summary = "Autenticar usuário", description = "Autentica o usuário por e-mail e senha e retorna um token JWT com validade de 10 minutos. Nas requisições seguintes, envie o token no cabeçalho Authorization no formato Bearer <token>")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário autenticado; retorna o token de acesso"),
            @ApiResponse(responseCode = "400", description = "Dados de login inválidos", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> entrar(
            @Valid @RequestBody LoginRequest dadosLogin
    ) {
        AuthSession sessao = authService.entrar(dadosLogin);

        Duration validadeCookie = Duration.between(
                LocalDateTime.now(ZoneId.of("America/Sao_Paulo")),
                sessao.refreshExpiresAt()
        );

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", sessao.refreshToken())
                .httpOnly(true)
                .secure(cookieDeSeguranca)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(validadeCookie)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponse(sessao.accessToken()));
    }

    @Operation(summary = "Cadastra um novo tutor", description = "Requisição para criar o cadastro de um novo tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tutor cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Tutor já cadastrado", content = @Content)
    })
    @PostMapping("/cadastrar")
    public ResponseEntity<TutorCadastroResponse> cadastrarTutor(@Valid @RequestBody CadastroTutorRequest tutorRequest) {
        TutorCadastroResponse tutor = tutorService.cadastrarTutor(tutorRequest);
        return ResponseEntity.created(URI.create("/cadastrar/" + tutor.id())).body(tutor);
    }

    @Operation(summary = "Renova o token JWT", description = "Requisição que valida se o token pode ser renovado e o renova em caso positivo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token renovado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Cookie ausente, token inválido, expirado ou reutilizado")
    })
    @PostMapping("/atualizar")
    public ResponseEntity<LoginResponse> renovar(
            @CookieValue(name = "refresh_token", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UsuarioNaoAutorizadoAEntrarException("Refresh token ausente");
        }

        AuthSession sessao = authService.renovar(refreshToken);

        Duration validadeCookie = Duration.between(
                LocalDateTime.now(ZoneId.of("America/Sao_Paulo")),
                sessao.refreshExpiresAt()
        );

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", sessao.refreshToken())
                .httpOnly(true)
                .secure(cookieDeSeguranca)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(validadeCookie)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponse(sessao.accessToken()));
    }

    @Operation(summary = "Encerra sessão", description = "Revoga a familia do refresh token e limpa o cookie de autenticação")
    @ApiResponse(responseCode = "204", description = "Sessão encerrada")
    @PostMapping("/sair")
    public ResponseEntity<Void> sair(
            @CookieValue(name = "refresh_token", required = false) String refreshToken
    ) {
        authService.sair(refreshToken);

        ResponseCookie cookie = ResponseCookie
                .from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieDeSeguranca)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @Value("${app.cookie.secure:false}")
    private boolean cookieDeSeguranca;
}
