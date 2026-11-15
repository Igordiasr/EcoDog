package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PlanoCriacaoRequest;
import br.com.ecodogpark.backend.dto.PlanoAtualizacaoRequest;
import br.com.ecodogpark.backend.dto.PlanoRespostaDTO;
import br.com.ecodogpark.backend.dto.ServicoRespostaDTO;
import br.com.ecodogpark.backend.entity.PlanosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.repository.PlanosRepository;
import br.com.ecodogpark.backend.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/planos")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Gestão de Planos", description = "Endpoints para cadastro e gestão de planos do EcoDog Park")
public class PlanosController {

    private final PlanosRepository planosRepository;
    private final ServicoRepository servicoRepository;

    @Autowired
    public PlanosController(PlanosRepository planosRepository, ServicoRepository servicoRepository) {
        this.planosRepository = planosRepository;
        this.servicoRepository = servicoRepository;
    }

    @Operation(summary = "Listar todos os planos", description = "Retorna a lista de todos os planos cadastrados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de planos retornada com sucesso", content = @Content(schema = @Schema(implementation = PlanoRespostaDTO.class)))
    })
    @GetMapping
    public ResponseEntity<List<PlanoRespostaDTO>> listarPlanos() {
        List<PlanoRespostaDTO> planos = planoParaDTO(planosRepository.findAllByOrderByNomeAsc());
        return ResponseEntity.ok(planos);
    }

    @Operation(summary = "Criar novo plano", description = "Cadastra um novo plano com os dados fornecidos.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Plano criado com sucesso", content = @Content(schema = @Schema(implementation = PlanoRespostaDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou serviço não encontrado", content = @Content)
    })
    @PostMapping
    public ResponseEntity<PlanoRespostaDTO> criarPlano(@Valid @RequestBody PlanoCriacaoRequest request) {
        ServicosEntity servico = servicoRepository.findById(request.getIdServico().longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido"));
        PlanosEntity plano = new PlanosEntity();
        plano.setNome(request.getNome());
        plano.setServico(servico);
        plano.setDiarias(request.getDiarias());
        plano.setValor(request.getValor());
        plano.setAtivo(true);
        PlanosEntity planoSalvo = planosRepository.save(plano);
        return ResponseEntity.status(201).body(planoParaDTOResponse(planoSalvo));
    }

    @Operation(summary = "Atualizar plano", description = "Atualiza os dados de um plano existente identificado pelo ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plano atualizado com sucesso", content = @Content(schema = @Schema(implementation = PlanoRespostaDTO.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou serviço não encontrado", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<PlanoRespostaDTO> atualizarPlano(@Parameter(description = "Identificador do plano", example = "1")
                                                           @PathVariable Long id,
                                                           @Valid @RequestBody PlanoAtualizacaoRequest request) {
        PlanosEntity planoExistente = planosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));
        ServicosEntity servico = servicoRepository.findById(request.getIdServico().longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido"));
        planoExistente.setNome(request.getNome());
        planoExistente.setServico(servico);
        planoExistente.setDiarias(request.getDiarias());
        planoExistente.setValor(request.getValor());
        planoExistente.setAtivo(request.getAtivo());
        PlanosEntity planoAtualizado = planosRepository.save(planoExistente);
        return ResponseEntity.ok(planoParaDTOResponse(planoAtualizado));
    }

    @Operation(summary = "Alternar status ativo do plano", description = "Altera o status ativo/inhabilitado de um plano.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status do plano alterado com sucesso", content = @Content(schema = @Schema(implementation = PlanoRespostaDTO.class))),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content)
    })
    @PatchMapping("/{id}/ativo")
    public ResponseEntity<PlanoRespostaDTO> toggularAtivo(@Parameter(description = "Identificador do plano", example = "1")
                                                          @PathVariable Long id) {
        PlanosEntity plano = planosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));
        plano.setAtivo(!plano.getAtivo());
        PlanosEntity planoAtualizado = planosRepository.save(plano);
        return ResponseEntity.ok(planoParaDTOResponse(planoAtualizado));
    }

    @Operation(summary = "Excluir plano", description = "Remove um plano identificado pelo ID. Bloqueia exclusão se houver registros vinculados.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Plano excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Plano não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Não é possível excluir: há registros vinculados", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirPlano(@Parameter(description = "Identificador do plano", example = "1")
                                             @PathVariable Long id) {
        // Verifica se há vinculos antes de excluir
        boolean temVinculo = verificaVinculoExclusao(id);
        if (temVinculo) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível excluir este plano pois há registros vinculados (ex: contratos, agendamentos).");
        }
        planosRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Listar serviços ativos para seleção", description = "Retorna a lista de serviços ativos disponíveis para seleção no cadastro/edição de planos.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de serviços ativos retornada com sucesso")
    })
    @GetMapping("/servicos-ativos")
    public ResponseEntity<List<ServicoRespostaDTO>> listarServicosAtivos() {
        List<ServicosEntity> servicos = servicoRepository.findAllByStatusTrueOrderByNomeAsc();
        List<ServicoRespostaDTO> dtoList = servicos.stream()
                .map(servico -> new ServicoRespostaDTO(
                        servico.getIdServico().longValue(),
                        servico.getNome(),
                        servico.getCategoria(),
                        servico.getModalidade(),
                        servico.getFrequencia(),
                        servico.getValor(),
                        servico.getStatus()
                ))
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    private List<PlanoRespostaDTO> planoParaDTO(List<PlanosEntity> planos) {
        return planos.stream()
                .map(this::planoParaDTO)
                .toList();
    }

    private PlanoRespostaDTO planoParaDTO(PlanosEntity plano) {
        return new PlanoRespostaDTO(
                plano.getId(),
                plano.getNome(),
                plano.getServico() != null ? plano.getServico().getIdServico().longValue() : null,
                plano.getServico() != null ? plano.getServico().getNome() : "",
                plano.getDiarias(),
                plano.getValor(),
                plano.getAtivo()
        );
    }

    private PlanoRespostaDTO planoParaDTOResponse(PlanosEntity plano) {
        return new PlanoRespostaDTO(
                plano.getId(),
                plano.getNome(),
                plano.getServico() != null ? plano.getServico().getIdServico().longValue() : null,
                plano.getServico() != null ? plano.getServico().getNome() : "",
                plano.getDiarias(),
                plano.getValor(),
                plano.getAtivo()
        );
    }

    private boolean verificaVinculoExclusao(Long idPlano) {
        // Placeholder: verificar se há entidades relacionadas que impedem a exclusão
        // Implementação futura conforme modelo de domínio
        return false;
    }
}