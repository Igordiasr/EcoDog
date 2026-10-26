package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.service.AgendamentoTutorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calendario")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoTutorController {
    private final AgendamentoTutorService agendamentoTutorService;

    public AgendamentoTutorController(AgendamentoTutorService agendamentoTutorService) {
        this.agendamentoTutorService = agendamentoTutorService;
    }

    @GetMapping("/pets")
    public ResponseEntity<List<PetsDoTutorResponse>> buscarPets(@RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.buscarPets(idUsuario));
    }

    @GetMapping("/disponibilidade")
    public ResponseEntity<List<VagasDisponiveisResponse>> buscarDisponibilidade(@RequestParam String servico,
                                                                                @RequestParam Integer ano,
                                                                                @RequestParam Integer mes) {
        List<VagasDisponiveisResponse> disponibilidade = agendamentoTutorService.buscarDisponibilidade(servico, ano, mes);
        return ResponseEntity.ok(disponibilidade);
    }

    @GetMapping("/tutor/agendamentos")
    public ResponseEntity<List<AgendamentosTutorResponse>> buscarAgendamentos(@RequestParam Long idUsuario,
                                                                              @RequestParam Integer ano,
                                                                              @RequestParam Integer mes) {
        return ResponseEntity.ok(agendamentoTutorService.buscarAgendamentosDoTutor(idUsuario, ano, mes));
    }

    @GetMapping("/servicos")
    public ResponseEntity<List<ServicoAtivoResponse>> buscarServicos(@RequestParam String categoria) {
        List<ServicoAtivoResponse> servicos = agendamentoTutorService.listarServicos(categoria);
        return ResponseEntity.ok(servicos);
    }

    @PostMapping("/orcamentos")
    public ResponseEntity<OrcamentoResponse> criarOrcamento(@RequestBody @Valid OrcamentoRequest request,
                                                             @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.calcularOrcamento(request, idUsuario));
    }

    @PostMapping("/agendamentos")
    public ResponseEntity<AgendamentoCriadoResponse> agendar(@RequestBody @Valid OrcamentoRequest request,
                                                             @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.criarAgendamento(request, idUsuario));
    }

    @PostMapping("/planos/agendamentos")
    public ResponseEntity<AgendamentoPlanoResponse> agendarPeloPlano(@RequestBody @Valid OrcamentoRequest request,
                                                                      @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.agendarPeloPlano(request, idUsuario));
    }

    @PatchMapping("/agendamentos/{idAgendamento}/cancelar")
    public ResponseEntity<CancelamentoResponse> cancelar(@PathVariable Long idAgendamento,
                                                         @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.cancelarAgendamento(idAgendamento, idUsuario));
    }
}