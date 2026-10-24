package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.service.AgendamentoTutorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoTutorController {
    private final AgendamentoTutorService agendamentoTutorService;

    public AgendamentoTutorController(AgendamentoTutorService agendamentoTutorService) {
        this.agendamentoTutorService = agendamentoTutorService;
    }

    @GetMapping("/pets-tutor")
    public ResponseEntity<List<PetsDoTutorResponse>> buscarPets(@RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.buscarPets(idUsuario));
    }

    @GetMapping("/calendario")
    public ResponseEntity<List<VagasDisponiveisResponse>> buscarDisponibilidade(@RequestParam String servico,
                                                                                @RequestParam Integer ano,
                                                                                @RequestParam Integer mes) {

        List<VagasDisponiveisResponse> disponibilidade = agendamentoTutorService.buscarDisponibilidade(servico, ano, mes);

        return ResponseEntity.ok(disponibilidade);
    }

    @GetMapping("/calendario/planos")
    public ResponseEntity<List<ServicoAtivoResponse>> buscarServicos(@RequestParam String categoria) {
        List<ServicoAtivoResponse> servicos = agendamentoTutorService.listarServicos(categoria);
        return ResponseEntity.ok(servicos);
    }

    @PostMapping("/calendario/planos/orcamento")
    public ResponseEntity<OrcamentoResponse> buscarOrcamento(@RequestBody @Valid OrcamentoRequest request,
                                                             @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.calcularOrcamento(request, idUsuario));
    }

    @PostMapping("/calendario/planos/orcamento/agendar")
    public ResponseEntity<AgendamentoCriadoResponse> agendar(@RequestBody @Valid OrcamentoRequest request,
                                                             @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.criarAgendamento(request, idUsuario));
    }

    @PostMapping("/calendario/plano/agendar")
    public ResponseEntity<AgendamentoCriadoResponse> agendarPeloPlano(@RequestBody @Valid OrcamentoRequest request,
                                                                      @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.agendarPeloPlano(request, idUsuario));
    }
}
