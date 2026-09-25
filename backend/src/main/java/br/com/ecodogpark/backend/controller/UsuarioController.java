package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.UsuarioRequest;
import br.com.ecodogpark.backend.dto.UsuarioResponse;
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
    public ResponseEntity<UsuarioResponse> criar(@Valid @RequestBody UsuarioRequest dto) {
        UsuarioResponse usuario = usuarioService.criar(dto);
        return ResponseEntity.created(URI.create("/usuarios/" + usuario.id())).body(usuario);
    }

    @GetMapping
    public List<UsuarioResponse> listar() { return usuarioService.listar(); }

    @GetMapping("/{id}")
    public UsuarioResponse buscarPorId(@PathVariable Long id) { return usuarioService.buscarPorId(id); }

    @PutMapping("/{id}")
    public UsuarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest dto) {
        return usuarioService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        usuarioService.excluir(id);
        return ResponseEntity.noContent().build();
    }

}
