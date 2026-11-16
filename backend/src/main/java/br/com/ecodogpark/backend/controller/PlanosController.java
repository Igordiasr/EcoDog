package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
import br.com.ecodogpark.backend.service.PlanosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/planos")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Gestão de Planos", description = "CRUD de planos disponíveis no EcoDog Park")
public class PlanosController {
    private final PlanosService planosService;

    public PlanosController(PlanosService planosService) { this.planosService = planosService; }

    @GetMapping
    @Operation(summary = "Listar planos", description = "Retorna todos os planos ordenados pelo nome.")
    public List<PlanoResponse> listar() { return planosService.listarTodos(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar plano por identificador", description = "Retorna os dados de um plano cadastrado.")
    public PlanoResponse buscar(@PathVariable Long id) { return planosService.buscarPorId(id); }

    @PostMapping
    @Operation(summary = "Criar plano", description = "Cadastra um plano associado a um serviço existente.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Plano criado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlanoResponse> criar(@Valid @RequestBody CriarPlanoRequest request) {
        PlanoResponse criado = planosService.criar(request);
        return ResponseEntity.created(URI.create("/api/planos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar plano", description = "Atualiza o nome, serviço, quantidade de diárias, valor e status do plano.")
    public PlanoResponse atualizar(@PathVariable Long id, @Valid @RequestBody AtualizarPlanoRequest request) {
        return planosService.atualizar(id, request);
    }

    @PatchMapping("/{id}/ativo")
    @Operation(summary = "Alternar status do plano", description = "Inverte o estado ativo do plano informado.")
    public PlanoResponse alternarAtivo(@PathVariable Long id) { return planosService.toggularAtivo(id); }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir plano", description = "Remove o plano quando não houver registros relacionados que impeçam a exclusão.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Plano excluído"),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Plano vinculado a outro registro", content = @Content)
    })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        try {
            planosService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível excluir o plano porque há registros vinculados.");
        }
    }

    @GetMapping("/servicos-ativos")
    @Operation(summary = "Listar serviços ativos para seleção", description = "Retorna os serviços ativos disponíveis no formulário de planos.")
    public List<ServicoPlanoResponse> listarServicosAtivos() { return planosService.listarServicosAtivos(); }
}
