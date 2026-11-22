package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginResponse;
import br.com.ecodogpark.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Autenticar usuário", description = "Autentica o usuário por e-mail e senha e retorna um token JWT com validade de 10 minutos. Nas requisições seguintes, envie o token no cabeçalho Authorization no formato Bearer <token>")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário autenticado; retorna o token de acesso"),
            @ApiResponse(responseCode = "400", description = "Dados de login inválidos", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> entrar(@Valid @RequestBody LoginRequest dadosLogin) {
        return ResponseEntity.ok(authService.entrar(dadosLogin));
    }
}
