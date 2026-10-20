package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.service.GerenciamentoCalendarioService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/calendario")
@CrossOrigin(origins = "http://localhost:5173")
public class GerenciamentoCalendarioController {
    private final GerenciamentoCalendarioService servico;

    public GerenciamentoCalendarioController(GerenciamentoCalendarioService servico) {
        this.servico = servico;
    }

    @GetMapping("/dias")
    public ResponseEntity<List<LocalDate>> listarDiasConfigurados(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return ResponseEntity.ok(servico.listarDiasConfigurados(mes));
    }

    @GetMapping("/dia")
    public ResponseEntity<CalendarioDiaResponse> buscarDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(servico.buscarDia(data));
    }

    @GetMapping("/catalogo-atividades")
    public ResponseEntity<List<AtividadeCalendarioResponse>> listarCatalogoAtividades() {
        return ResponseEntity.ok(servico.listarCatalogoAtividades());
    }

    @PutMapping("/{data}/vagas")
    public ResponseEntity<CalendarioDiaResponse> atualizarVagas(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Valid @RequestBody VagasCalendarioRequest requisicao) {
        return ResponseEntity.ok(servico.atualizarVagas(data, requisicao));
    }

    @PostMapping("/{data}/atividades")
    public ResponseEntity<AtividadeCalendarioResponse> adicionarAtividade(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Valid @RequestBody AdicionarAtividadeCalendarioRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servico.adicionarAtividade(data, requisicao));
    }

    @DeleteMapping("/atividades/{id}")
    public ResponseEntity<Void> removerAtividade(@PathVariable Long id) {
        servico.removerAtividade(id);
        return ResponseEntity.noContent().build();
    }
}
