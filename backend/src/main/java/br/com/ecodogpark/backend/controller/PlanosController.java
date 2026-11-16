package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PlanoAtualizacaoRequest;
import br.com.ecodogpark.backend.dto.PlanoCriacaoRequest;
import br.com.ecodogpark.backend.dto.PlanoRespostaDTO;
import br.com.ecodogpark.backend.dto.ServicoRespostaDTO;
import br.com.ecodogpark.backend.entity.PlanosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
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

    public PlanosController(PlanosService planosService) {
        this.planosService = planosService;
    }

    @GetMapping
    @Operation(summary = "Listar planos")
    public List<PlanoRespostaDTO> listar() {
        return planosService.listarTodos().stream().map(this::paraResposta).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar plano por identificador")
    public PlanoRespostaDTO buscar(@PathVariable Long id) {
        return paraResposta(planosService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Criar plano")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Plano criado", content = @Content(schema = @Schema(implementation = PlanoRespostaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content)
    })
    public ResponseEntity<PlanoRespostaDTO> criar(@Valid @RequestBody PlanoCriacaoRequest request) {
        PlanosEntity criado = planosService.criar(paraEntity(request));
        return ResponseEntity.created(URI.create("/api/planos/" + criado.getId())).body(paraResposta(criado));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Editar plano")
    public PlanoRespostaDTO atualizar(@PathVariable Long id, @Valid @RequestBody PlanoAtualizacaoRequest request) {
        return paraResposta(planosService.atualizar(id, paraEntity(request)));
    }

    @PatchMapping("/{id}/ativo")
    @Operation(summary = "Alternar status do plano")
    public PlanoRespostaDTO alternarAtivo(@PathVariable Long id) {
        return paraResposta(planosService.toggularAtivo(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir plano")
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
    @Operation(summary = "Listar serviços ativos para seleção")
    public List<ServicoRespostaDTO> listarServicosAtivos() {
        return planosService.listarServicosAtivos().stream().map(this::paraServicoResposta).toList();
    }

    private PlanosEntity paraEntity(PlanoCriacaoRequest request) {
        PlanosEntity entity = new PlanosEntity();
        entity.setNome(request.getNome());
        entity.setServico(servicoComId(request.getIdServico()));
        entity.setDiarias(request.getDiarias());
        entity.setValor(request.getValor());
        entity.setAtivo(true);
        return entity;
    }

    private PlanosEntity paraEntity(PlanoAtualizacaoRequest request) {
        PlanosEntity entity = new PlanosEntity();
        entity.setNome(request.getNome());
        entity.setServico(servicoComId(request.getIdServico()));
        entity.setDiarias(request.getDiarias());
        entity.setValor(request.getValor());
        entity.setAtivo(request.getAtivo());
        return entity;
    }

    private ServicosEntity servicoComId(Long id) {
        try {
            ServicosEntity servico = new ServicosEntity();
            servico.setIdServico(Math.toIntExact(id));
            return servico;
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido");
        }
    }

    private PlanoRespostaDTO paraResposta(PlanosEntity plano) {
        return new PlanoRespostaDTO(plano.getId(), plano.getNome(),
                plano.getServico().getIdServico().longValue(), plano.getServico().getNome(),
                plano.getDiarias(), plano.getValor(), plano.getAtivo());
    }

    private ServicoRespostaDTO paraServicoResposta(ServicosEntity servico) {
        return new ServicoRespostaDTO(servico.getIdServico().longValue(), servico.getNome(),
                servico.getCategoria(), servico.getModalidade(), servico.getFrequencia(),
                servico.getValor(), servico.getStatus());
    }
}
