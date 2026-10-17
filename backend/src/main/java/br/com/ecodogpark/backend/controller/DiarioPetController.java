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

        LocalDate dataReferencia = data != null ? data : LocalDate.now(FUSO_HORARIO);
        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, dataReferencia));
    }
}
