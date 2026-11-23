package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.UsuarioDTO.ClienteResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.FuncionarioResponse;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioResponse;
import br.com.ecodogpark.backend.service.UsuarioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @Operation(summary = "Listar clientes", description = "Lista os tutores, seus Pets e respectivos contratos, incluindo informações de diárias e dias da semana contratados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso")
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteResponse>> buscarClientes() {
        return ResponseEntity.ok(usuarioService.buscarClientes());
    }

    // ------------------------------- Endpoints para Gestão de Monitores --------------------------------------------

    @Operation(summary = "Listar monitores", description = "Lista os usuários do tipo monitor. Retorna 204 quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/monitores")
    public ResponseEntity<List<FuncionarioResponse>> listarMonitores() {
        List<FuncionarioResponse> monitores = usuarioService.listarMonitores();
        if (monitores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(monitores);
    }

    @Operation(summary = "Cadastrar monitor", description = "Cadastrar os dados do monitor.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/monitores")
    public ResponseEntity<FuncionarioResponse> cadastrarMonitor(@Valid @RequestBody MonitorRequest monitorRequest) {
        FuncionarioResponse monitor = usuarioService.cadastrarMonitor(monitorRequest);
        return ResponseEntity.created(URI.create("/usuarios/monitores/" + monitor.id())).body(monitor);
    }

    @Operation(summary = "Buscar monitor", description = "Buscar os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/monitores/{id}")
    public ResponseEntity<FuncionarioResponse> buscarMonitorPorId(@Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.buscarMonitorPorId(id));
    }

    @Operation(summary = "Atualizar monitor", description = "Atualizar os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/monitores/{id}")
    public ResponseEntity<FuncionarioResponse> atualizarMonitor(@Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id, @Valid @RequestBody MonitorRequest monitorRequest) {
        return ResponseEntity.ok(usuarioService.atualizarMonitor(id, monitorRequest));
    }

    @Operation(summary = "Excluir monitor", description = "Excluir os dados do monitor identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Monitor não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/monitores/{id}")
    public ResponseEntity<Void> excluirMonitor(@Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id) {
        usuarioService.excluirMonitor(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------- Endpoints para Gestão de Administradores -----------------------------------

    @Operation(summary = "Listar administradores", description = "Lista os usuários do tipo administrador. Retorna 204 quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum usuário encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/administradores")
    public ResponseEntity<List<FuncionarioResponse>> listarAdministradores() {
        List<FuncionarioResponse> administradores = usuarioService.listarAdministradores();
        if (administradores.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(administradores);
    }

    @Operation(summary = "Cadastrar administrador", description = "Cadastrar os dados do administrador.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/administradores")
    public ResponseEntity<FuncionarioResponse> cadastrarAdministrador(@Valid @RequestBody UsuarioRequest request) {
        FuncionarioResponse administrador = usuarioService.cadastrarAdministrador(request);
        return ResponseEntity.created(URI.create("/usuarios/administradores/" + administrador.id())).body(administrador);
    }

    @Operation(summary = "Buscar administrador", description = "Buscar os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/administradores/{id}")
    public ResponseEntity<FuncionarioResponse> buscarAdministradorPorId(@Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.buscarAdministradorPorId(id));
    }

    @Operation(summary = "Atualizar administrador", description = "Atualizar os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/administradores/{id}")
    public ResponseEntity<FuncionarioResponse> atualizarAdministrador(
            @Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id, @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarAdministrador(id, request));
    }

    @Operation(summary = "Excluir administrador", description = "Excluir os dados do administrador identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Administrador não encontrado", content = @Content)
    })
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/administradores/{id}")
    public ResponseEntity<Void> excluirAdministrador(@Parameter(description = "Identificador do registro", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID id) {
        usuarioService.excluirAdministrador(id);
        return ResponseEntity.noContent().build();
    }
}
