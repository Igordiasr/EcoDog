package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
import br.com.ecodogpark.backend.service.PlanosService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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
    @Operation(summary = "Listar planos", description = "Retorna todos os planos cadastrados, ordenados pelo nome. A resposta inclui os dados do serviço associado e o status de cada plano.")
    @ApiResponse(responseCode = "200", description = "Lista de planos retornada", content = @Content(array = @ArraySchema(schema = @Schema(implementation = PlanoResponse.class))))
    public List<PlanoResponse> listar() { return planosService.listarTodos(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar plano por identificador", description = "Retorna os dados de um plano cadastrado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plano encontrado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    public PlanoResponse buscar(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id) {
        return planosService.buscarPorId(id);
    }

    @PostMapping
    @Operation(summary = "Criar plano", description = "Cadastra um plano associado a um serviço existente. O plano é criado ativo; o campo ativo não deve ser enviado no corpo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Plano criado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou serviço inexistente", content = @Content)
    })
    public ResponseEntity<PlanoResponse> criar(@Valid @RequestBody CriarPlanoRequest request) {
        PlanoResponse criado = planosService.criar(request);
        return ResponseEntity.created(URI.create("/api/planos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar plano", description = "Substitui os dados editáveis do plano, incluindo nome, serviço, quantidade de diárias, valor e status ativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plano atualizado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou serviço inexistente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    public PlanoResponse atualizar(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id,
                                   @Valid @RequestBody AtualizarPlanoRequest request) {
        return planosService.atualizar(id, request);
    }

    @PatchMapping("/{id}/ativo")
    @Operation(summary = "Alternar status do plano", description = "Inverte o status ativo do plano: ativo passa a inativo e inativo passa a ativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status do plano atualizado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    public PlanoResponse alternarAtivo(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id) {
        return planosService.toggularAtivo(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir plano", description = "Remove o plano. A exclusão não é permitida quando existem registros relacionados ao plano.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Plano excluído"),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Plano vinculado a outro registro", content = @Content)
    })
    public ResponseEntity<Void> excluir(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id) {
        try {
            planosService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível excluir o plano porque há registros vinculados.");
        }
    }

    @GetMapping("/servicos-ativos")
    @Operation(summary = "Listar serviços ativos para seleção", description = "Retorna os serviços ativos disponíveis para associar a um plano, ordenados pelo nome.")
    @ApiResponse(responseCode = "200", description = "Lista de serviços ativos retornada", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServicoPlanoResponse.class))))
    public List<ServicoPlanoResponse> listarServicosAtivos() { return planosService.listarServicosAtivos(); }
}
