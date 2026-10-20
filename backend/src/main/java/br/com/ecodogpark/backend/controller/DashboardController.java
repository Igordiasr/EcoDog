package br.com.ecodogpark.backend.controller;

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

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DadosDashboardResponse> buscarDados() {
        return ResponseEntity.ok(dashboardService.buscarDados());
    }

    @GetMapping("/metas")
    public ResponseEntity<List<MetaParaListaResponse>> buscarMetas(@RequestParam LocalDate mesReferencia, @RequestParam String servico) {
        return ResponseEntity.ok(dashboardService.buscarMetas(mesReferencia, servico));
    }

    @GetMapping("/servicos")
    public ResponseEntity<List<ServicoParaListaResponse>> buscarServicos() {
        return ResponseEntity.ok(dashboardService.buscarServicos());
    }

    @PostMapping("/metas")
    public ResponseEntity<ManipulacaoMetaResponse> cadastrarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta) {
        return ResponseEntity.status(201).body(dashboardService.cadastrarMeta(novaMeta));
    }

    @PutMapping("/metas/{id}")
    public ResponseEntity<ManipulacaoMetaResponse> alterarMeta(@RequestBody @Valid ManipulacaoMetaRequest novaMeta, @PathVariable Long id) {
        return ResponseEntity.status(201).body(dashboardService.atualizarMeta(novaMeta, id));
    }

    @GetMapping("/movimentacoes")
    public ResponseEntity<List<MovimentacaoPendenteResponse>> listarMovimentacoesPendentes() {
        return ResponseEntity.ok(dashboardService.buscarMovimentacoesPendentes());
    }

    @PutMapping("/movimentacoes/{id}")
    public ResponseEntity<MovimentacoesEntity> atualizarMovimentacao(@RequestBody @Valid AlterarMovimentacaoRequest movimentacao, @PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.atualizarMovimentacao(movimentacao, id));
    }
}
