package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.DiarioPetResponse;
import br.com.ecodogpark.backend.service.DiarioPetService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/diario")
@CrossOrigin(origins = "http://localhost:5173")
public class DiarioPetController {

    private static final ZoneId FUSO_HORARIO = ZoneId.of("America/Sao_Paulo");

    private final DiarioPetService diarioPetService;

    public DiarioPetController(DiarioPetService diarioPetService) {
        this.diarioPetService = diarioPetService;
    }

    @GetMapping("/{idPet}")
    public ResponseEntity<DiarioPetResponse> obterDiarioDoPet(
            @PathVariable Long idPet,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        // O diário do pet sempre representa o dia solicitado; quando nenhuma data
        // é informada, utiliza-se a data atual (fuso America/Sao_Paulo), de modo
        // a não retornar dados de dias anteriores.
        LocalDate dataReferencia = data != null ? data : LocalDate.now(FUSO_HORARIO);
        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, dataReferencia));
    }

    // Funcionalidade explícita de histórico: permite consultar o diário de um pet
    // em uma data específica, sem alterar o comportamento do diário do dia.
    @GetMapping("/{idPet}/historico")
    public ResponseEntity<DiarioPetResponse> obterHistoricoDoPet(
            @PathVariable Long idPet,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, data));
    }
}
