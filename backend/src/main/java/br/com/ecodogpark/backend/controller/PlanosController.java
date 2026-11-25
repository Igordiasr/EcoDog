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
@RequestMapping("/planos")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Gestão de Planos", description = "Gestão de serviços da modalidade PLANO cadastrados em servicos")
public class PlanosController {
    private final PlanosService planosService;

    public PlanosController(PlanosService planosService) { this.planosService = planosService; }

    @GetMapping
    @Operation(summary = "Listar planos", description = "Retorna os registros de servicos cuja modalidade é PLANO, ordenados pelo nome.")
    @ApiResponse(responseCode = "200", description = "Lista de planos retornada", content = @Content(array = @ArraySchema(schema = @Schema(implementation = PlanoResponse.class))))
    public List<PlanoResponse> listar() { return planosService.listarTodos(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar plano por identificador", description = "Retorna um serviço cadastrado com modalidade PLANO.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plano encontrado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    public PlanoResponse buscar(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id) {
        return planosService.buscarPorId(id);
    }

    @PostMapping
    @Operation(summary = "Criar plano", description = "Cria um registro em servicos com modalidade PLANO. A categoria é herdada de um serviço de referência ativo e o novo serviço é criado ativo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Plano criado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou serviço inexistente", content = @Content)
    })
    public ResponseEntity<PlanoResponse> criar(@Valid @RequestBody CriarPlanoRequest request) {
        PlanoResponse criado = planosService.criar(request);
        return ResponseEntity.created(URI.create("/planos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar plano", description = "Atualiza nome, categoria derivada do serviço de referência, frequência, valor e status do serviço PLANO.")
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
    @Operation(summary = "Alternar status do plano", description = "Inverte a coluna status do serviço cuja modalidade é PLANO.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status do plano atualizado", content = @Content(schema = @Schema(implementation = PlanoResponse.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    public PlanoResponse alternarAtivo(@Parameter(description = "Identificador do plano", example = "1") @PathVariable Long id) {
        return planosService.toggularAtivo(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir plano", description = "Remove o serviço cuja modalidade é PLANO. A exclusão não é permitida quando há contratos vinculados.")
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
    @Operation(summary = "Listar serviços ativos para seleção", description = "Retorna serviços ativos de referência (modalidades diferentes de PLANO) em categorias válidas, ordenados pelo nome.")
    @ApiResponse(responseCode = "200", description = "Lista de serviços ativos retornada", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ServicoPlanoResponse.class))))
    public List<ServicoPlanoResponse> listarServicosAtivos() { return planosService.listarServicosAtivos(); }
}
