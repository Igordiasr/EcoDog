package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarStatusRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.service.PlanosService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/servicos")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanosController {
    private final PlanosService service;

    public PlanosController(PlanosService service) {
        this.service = service;
    }

    @GetMapping
    public List<PlanoResponse> listar(@RequestParam(required = false) Boolean status) {
        return service.listarTodos(status);
    }

    @GetMapping("/{id}")
    public PlanoResponse buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<PlanoResponse> criar(@Valid @RequestBody CriarPlanoRequest request) {
        PlanoResponse criado = service.criar(request);
        return ResponseEntity.created(URI.create("/servicos/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    public PlanoResponse atualizar(@PathVariable Long id,
                                   @Valid @RequestBody AtualizarPlanoRequest request) {
        return service.atualizar(id, request);
    }

    @PatchMapping("/{id}/status")
    public PlanoResponse atualizarStatus(@PathVariable Long id,
                                         @Valid @RequestBody AtualizarStatusRequest request) {
        return service.atualizarStatus(id, request.status());
    }
}
