package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.DashboardDTO.request.AlterarMovimentacaoRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.request.ManipulacaoMetaRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.*;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import br.com.ecodogpark.backend.service.DashboardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Requisições dashboard", description = "Endpoints para requisições relacionadas a dashboard")
@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Buscar dados dashboard", description = "Requisição responsável por buscar todos os dados de métricas e gráficos da dashboard")
    @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso")
    @GetMapping
    public ResponseEntity<DadosDashboardResponse> buscarDados() {
        return ResponseEntity.ok(dashboardService.buscarDados());
    }

    @Operation(summary = "Buscar metas", description = "Requisição para buscar as metas cadastradas para exibição no dropdown da edição de metas")
    @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso")
    @GetMapping("/metas")
    public ResponseEntity<List<MetaParaListaResponse>> buscarMetas(@Parameter(description = "Data de referência do mês da meta (yyyy-MM-dd)", example = "2026-10-26")
            @RequestParam LocalDate mesReferencia, @Parameter(description = "Nome do serviço usado para filtrar as metas", example = "Creche")
            @RequestParam String servico) {
        return ResponseEntity.ok(dashboardService.buscarMetas(mesReferencia, servico));
    }

    @Operation(summary = "Listar serviços", description = "Busca os serviços disponíveis para seleção no gerenciamento de metas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso")
    })
    @GetMapping("/servicos")
    public ResponseEntity<List<ServicoParaListaResponse>> buscarServicos() {
        return ResponseEntity.ok(dashboardService.buscarServicos());
    }

    @Operation(summary = "Cadastrar meta", description = "Cadastra uma meta de receita por mês de referência e serviço, com valor positivo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da meta inválidos", content = @Content)
    })
    @PostMapping("/metas")
    public ResponseEntity<ManipulacaoMetaResponse> cadastrarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta) {
        return ResponseEntity.status(201).body(dashboardService.cadastrarMeta(novaMeta));
    }

    @Operation(summary = "Atualizar meta", description = "Atualiza os dados da meta identificada pelo ID. A implementação retorna HTTP 201.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da meta inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Meta não encontrada", content = @Content)
    })
    @PutMapping("/metas/{id}")
    public ResponseEntity<ManipulacaoMetaResponse> alterarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta, @Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.status(201).body(dashboardService.atualizarMeta(novaMeta, id));
    }

    @Operation(summary = "Listar movimentações pendentes", description = "Busca as movimentações financeiras pendentes de pagamento.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso")
    })
    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoPendenteResponse>> listarMovimentacoesPendentes() {
        return ResponseEntity.ok(dashboardService.buscarMovimentacoesPendentes());
    }

    @Operation(summary = "Atualizar movimentação", description = "Atualiza a forma de pagamento, a data de pagamento e o contrato da movimentação.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da movimentação inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Movimentação não encontrada", content = @Content)
    })
    @PutMapping("/movimentacoes/{id}")
    public ResponseEntity<MovimentacoesEntity> atualizarMovimentacao(@RequestBody @Valid AlterarMovimentacaoRequest movimentacao, @Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.atualizarMovimentacao(movimentacao, id));
    }
}
