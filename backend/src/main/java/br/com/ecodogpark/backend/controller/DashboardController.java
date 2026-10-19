package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.DashboardDTO.DadosDashboardResponse;
import br.com.ecodogpark.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
