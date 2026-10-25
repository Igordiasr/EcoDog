package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response.AtividadesDoDiaResponse;
import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.request.AtualizarAtividadeRequest;
import br.com.ecodogpark.backend.service.AtividadesDoDiaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/atividades")
@CrossOrigin(origins = "http://localhost:5173")
public class AtividadesDoDiaController {
    private final AtividadesDoDiaService atividadesDoDiaService;

    public AtividadesDoDiaController(AtividadesDoDiaService atividadesDoDiaService) {
        this.atividadesDoDiaService = atividadesDoDiaService;
    }

    @GetMapping
    public ResponseEntity<AtividadesDoDiaResponse> buscarAtividadesDoDia() {
        return ResponseEntity.ok(atividadesDoDiaService.buscarAtividadesDoDia());
    }

    @PutMapping
    public ResponseEntity<Void> concluirAtividade(@RequestBody @Valid AtualizarAtividadeRequest atividade) {
        atividadesDoDiaService.concluirAtividade(atividade.situacao(), atividade.idAtividade());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/atualizarPets")
    public ResponseEntity<Void> concluirAtividadeTodosPets(@RequestBody List<Long> idsParticipacoes) {
        atividadesDoDiaService.concluirAtividadeTodosPets(idsParticipacoes);
        return ResponseEntity.noContent().build();
    }
}
