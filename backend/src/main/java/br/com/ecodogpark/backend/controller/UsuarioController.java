package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.MonitorResponse;
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
    public ResponseEntity<UsuarioResponse> cadastrarTutor(@Valid @RequestBody UsuarioRequest usuarioRequest) {
        UsuarioResponse usuario = usuarioService.cadastrarTutor(usuarioRequest);
        return ResponseEntity.created(URI.create("/usuarios/" + usuario.id())).body(usuario);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTutores() {
        List<UsuarioResponse> tutores = usuarioService.listarTutores();
        if (tutores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(tutores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarTutorPorId(@PathVariable Long id) {
        UsuarioResponse usuario = usuarioService.buscarTutorPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizarTutor(@PathVariable Long id, @Valid @RequestBody UsuarioRequest usuarioRequest) {
        UsuarioResponse usuarioAtualizado = usuarioService.atualizarTutor(id, usuarioRequest);
        return ResponseEntity.ok().body(usuarioAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTutor(@PathVariable Long id) {
        usuarioService.excluirTutor(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------- Endpoints para Gestão de Usuários --------------------------------------------
    @GetMapping("/monitores")
    public ResponseEntity<List<MonitorResponse>> listarMonitores() {
        List<MonitorResponse> monitores = usuarioService.listarMonitores();
        if (monitores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(monitores);
    }

    @PostMapping("/monitores")
    public ResponseEntity<MonitorResponse> cadastrarMonitor(@Valid @RequestBody MonitorRequest monitorRequest) {
        MonitorResponse monitor = usuarioService.cadastrarMonitor(monitorRequest);
        return ResponseEntity.created(URI.create("/usuarios/monitores" + monitor.id())).body(monitor);
    }

    @GetMapping("/monitores/{id}")
    public ResponseEntity<MonitorResponse> buscarMonitorPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarMonitorPorId(id));
    }

    @PutMapping("/monitores/{id}")
    public ResponseEntity<MonitorResponse> atualizarMonitor(@PathVariable Long id, @Valid @RequestBody MonitorRequest monitorRequest) {
        return ResponseEntity.ok(usuarioService.atualizarMonitor(id, monitorRequest));
    }

    @DeleteMapping("/monitores/{id}")
    public ResponseEntity<Void> excluirMonitor(@PathVariable Long id) {
        usuarioService.excluirMonitor(id);
        return ResponseEntity.noContent().build();
    }
}