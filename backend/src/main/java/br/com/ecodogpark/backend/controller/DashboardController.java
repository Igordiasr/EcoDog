package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.DashboardDTO.request.AlterarMovimentacaoRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.request.ManipulacaoMetaRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.*;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import br.com.ecodogpark.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public ResponseEntity<List<MetaParaListaResponse>> buscarMetas(@RequestParam LocalDate mesReferencia, @RequestParam String servico) {
        return ResponseEntity.ok(dashboardService.buscarMetas(mesReferencia, servico));
    }

    @Operation(summary = "", description = "")
    @ApiResponse(responseCode = "", description = "")
    @GetMapping("/servicos")
    public ResponseEntity<List<ServicoParaListaResponse>> buscarServicos() {
        return ResponseEntity.ok(dashboardService.buscarServicos());
    }

    @Operation(summary = "", description = "")
    @PostMapping("/metas")
    public ResponseEntity<ManipulacaoMetaResponse> cadastrarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta) {
        return ResponseEntity.status(201).body(dashboardService.cadastrarMeta(novaMeta));
    }

    @Operation(summary = "", description = "")
    @PutMapping("/metas/{id}")
    public ResponseEntity<ManipulacaoMetaResponse> alterarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta, @PathVariable Long id) {
        return ResponseEntity.status(201).body(dashboardService.atualizarMeta(novaMeta, id));
    }

    @Operation(summary = "", description = "")
    @ApiResponse(responseCode = "", description = "")
    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoPendenteResponse>> listarMovimentacoesPendentes() {
        return ResponseEntity.ok(dashboardService.buscarMovimentacoesPendentes());
    }

    @Operation(summary = "", description = "")
    @PutMapping("/movimentacoes/{id}")
    public ResponseEntity<MovimentacoesEntity> atualizarMovimentacao(@RequestBody @Valid AlterarMovimentacaoRequest movimentacao, @PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.atualizarMovimentacao(movimentacao, id));
    }
}
