package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AtividadesResponse;
import br.com.ecodogpark.backend.dto.AtualizarAtividadeRequest;
import br.com.ecodogpark.backend.service.AtividadesService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atividades")
public class AtividadesController {
    private final AtividadesService atividadesService;

    public AtividadesController(AtividadesService atividadesService) {
        this.atividadesService = atividadesService;
    }

    @GetMapping
    public ResponseEntity<AtividadesResponse> buscarAtividadesDoDia() {
        return ResponseEntity.ok(atividadesService.buscarAtividadesDoDia());
    }

    @PutMapping
    public ResponseEntity<Void> concluirAtividade(@RequestBody @Valid AtualizarAtividadeRequest atividade) {
        atividadesService.concluirAtividade(atividade.situacao(), atividade.idAtividade());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/atualizarPets")
    public ResponseEntity<Void> concluirAtividadeTodosPets(@RequestBody List<Long> idsParticipacoes) {
        atividadesService.concluirAtividadeTodosPets(idsParticipacoes);
        return ResponseEntity.noContent().build();
    }
}
