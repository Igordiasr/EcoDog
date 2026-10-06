package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.DiarioPetRequest;
import br.com.ecodogpark.backend.dto.DiarioPetResponse;
import br.com.ecodogpark.backend.service.DiarioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/diarios")
@CrossOrigin(origins = "http://localhost:5173")
public class DiarioController {
    private final DiarioService diarioService;

    public DiarioController(DiarioService diarioService) {
        this.diarioService = diarioService;
    }

    @PostMapping("/resumo")
    public ResponseEntity<DiarioPetResponse> registrarAtividade(@Valid @RequestBody DiarioPetRequest dto) {
        DiarioPetResponse resumo = diarioService.registrarAtividade(dto);
        return ResponseEntity.created(URI.create("/diarios/resumo")).body(resumo);
    }

    @GetMapping("/pet/{idPet}")
    public List<DiarioPetResponse> buscarAtividadePorPet(@PathVariable Long idPet) {
        return diarioService.buscarAtividadePorPet(idPet);
    }
}
