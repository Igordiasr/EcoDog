package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.UsuarioRequestDto;
import br.com.ecodogpark.backend.dto.UsuarioResponseDto;
import br.com.ecodogpark.backend.service.UsuarioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDto> criar(@Valid @RequestBody UsuarioRequestDto dto) {
        UsuarioResponseDto usuario = usuarioService.criar(dto);
        return ResponseEntity.created(URI.create("/usuarios/" + usuario.id())).body(usuario);
    }

    @GetMapping
    public List<UsuarioResponseDto> listar() { return usuarioService.listar(); }

    @GetMapping("/{id}")
    public UsuarioResponseDto buscarPorId(@PathVariable Long id) { return usuarioService.buscarPorId(id); }

    @PutMapping("/{id}")
    public UsuarioResponseDto atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDto dto) {
        return usuarioService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }

}
