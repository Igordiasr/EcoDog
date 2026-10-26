package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Requisições usuários", description = "Endpoints para cadastro e gestão de tutores, monitores e administradores")
@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Cadastrar tutor", description = "Cadastrar os dados do tutor.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content)
    })
    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrarTutor(@Valid @RequestBody UsuarioRequest usuarioRequest) {
        UsuarioResponse usuario = usuarioService.cadastrarTutor(usuarioRequest);
        return ResponseEntity.created(URI.create("/usuarios/" + usuario.id())).body(usuario);
    }

    @Operation(summary = "Listar tutores", description = "Lista os usuários do tipo tutor. Retorna 204 quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTutores() {
        List<UsuarioResponse> tutores = usuarioService.listarTutores();
        if (tutores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(tutores);
    }

    @Operation(summary = "Buscar tutor", description = "Buscar os dados do tutor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarTutorPorId(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        UsuarioResponse usuario = usuarioService.buscarTutorPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @Operation(summary = "Atualizar tutor", description = "Atualizar os dados do tutor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizarTutor(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id, @Valid @RequestBody UsuarioRequest usuarioRequest) {
        UsuarioResponse usuarioAtualizado = usuarioService.atualizarTutor(id, usuarioRequest);
        return ResponseEntity.ok().body(usuarioAtualizado);
    }

    @Operation(summary = "Excluir tutor", description = "Excluir os dados do tutor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirTutor(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        usuarioService.excluirTutor(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------- Endpoints para Gestão de Usuários --------------------------------------------
    @Operation(summary = "Listar monitores", description = "Lista os usuários do tipo monitor. Retorna 204 quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado", content = @Content)
    })
    @GetMapping("/monitores")
    public ResponseEntity<List<MonitorResponse>> listarMonitores() {
        List<MonitorResponse> monitores = usuarioService.listarMonitores();
        if (monitores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(monitores);
    }

    @Operation(summary = "Cadastrar monitor", description = "Cadastrar os dados do monitor.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content)
    })
    @PostMapping("/monitores")
    public ResponseEntity<MonitorResponse> cadastrarMonitor(@Valid @RequestBody MonitorRequest monitorRequest) {
        MonitorResponse monitor = usuarioService.cadastrarMonitor(monitorRequest);
        return ResponseEntity.created(URI.create("/usuarios/monitores/" + monitor.id())).body(monitor);
    }

    @Operation(summary = "Buscar monitor", description = "Buscar os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @GetMapping("/monitores/{id}")
    public ResponseEntity<MonitorResponse> buscarMonitorPorId(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarMonitorPorId(id));
    }

    @Operation(summary = "Atualizar monitor", description = "Atualizar os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @PutMapping("/monitores/{id}")
    public ResponseEntity<MonitorResponse> atualizarMonitor(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id, @Valid @RequestBody MonitorRequest monitorRequest) {
        return ResponseEntity.ok(usuarioService.atualizarMonitor(id, monitorRequest));
    }

    @Operation(summary = "Excluir monitor", description = "Excluir os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @DeleteMapping("/monitores/{id}")
    public ResponseEntity<Void> excluirMonitor(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        usuarioService.excluirMonitor(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------- Endpoints para Gestão de Administradores -----------------------------------
    @Operation(summary = "Listar administradores", description = "Lista os usuários do tipo administrador. Retorna 204 quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado", content = @Content)
    })
    @GetMapping("/administradores")
    public ResponseEntity<List<UsuarioResponse>> listarAdministradores() {
        List<UsuarioResponse> administradores = usuarioService.listarAdministradores();
        if (administradores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(administradores);
    }

    @Operation(summary = "Cadastrar administrador", description = "Cadastrar os dados do administrador.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content)
    })
    @PostMapping("/administradores")
    public ResponseEntity<UsuarioResponse> cadastrarAdministrador(@Valid @RequestBody UsuarioRequest request) {
        UsuarioResponse administrador = usuarioService.cadastrarAdministrador(request);
        return ResponseEntity.created(URI.create("/usuarios/administradores/" + administrador.id())).body(administrador);
    }

    @Operation(summary = "Buscar administrador", description = "Buscar os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @GetMapping("/administradores/{id}")
    public ResponseEntity<UsuarioResponse> buscarAdministradorPorId(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarAdministradorPorId(id));
    }

    @Operation(summary = "Atualizar administrador", description = "Atualizar os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @PutMapping("/administradores/{id}")
    public ResponseEntity<UsuarioResponse> atualizarAdministrador(
            @Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarAdministrador(id, request));
    }

    @Operation(summary = "Excluir administrador", description = "Excluir os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @DeleteMapping("/administradores/{id}")
    public ResponseEntity<Void> excluirAdministrador(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        usuarioService.excluirAdministrador(id);
        return ResponseEntity.noContent().build();
    }
}
