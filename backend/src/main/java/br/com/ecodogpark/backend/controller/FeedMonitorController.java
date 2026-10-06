package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import br.com.ecodogpark.backend.entity.id.AgendamentoId;
import br.com.ecodogpark.backend.entity.id.AtividadeDoDiaId;
import br.com.ecodogpark.backend.service.FeedMonitorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/feed-monitor")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedMonitorController {
    private final FeedMonitorService feedMonitorService;

    public FeedMonitorController(FeedMonitorService feedMonitorService) {
        this.feedMonitorService = feedMonitorService;
    }

    @GetMapping("/pet/{id}")
    public ResponseEntity<PetResponse> buscarPetParaMonitor(@PathVariable Long id) {
        PetResponse pet = feedMonitorService.buscarPetParaMonitor(id);

        return ResponseEntity.ok(pet);
    }

    @GetMapping("/pet/{id}/atividades")
    public ResponseEntity<List<AtividadeDoDiaResponse>> atividadesDoPet(@PathVariable Long id) {
        List<AtividadeDoDiaResponse> atividades = feedMonitorService.buscarAtividades(id);

        return ResponseEntity.ok(atividades);
    }

    @GetMapping("/pet/{id}/medicacoes")
    public ResponseEntity<List<MedicacaoDoDiaResponse>> medicacaoDoPet(@PathVariable Long id) {
        List<MedicacaoDoDiaResponse> medicacoes = feedMonitorService.buscarMedicacao(id);

        return ResponseEntity.ok(medicacoes);
    }

    @PostMapping("/pet/{id}/observacoes")
    public ResponseEntity<ObservacaoDoDiaResponse> criarObservacao(@PathVariable Long id,
                                                                   @Valid @RequestBody ObservacaoDoDiaRequest request) {
        ObservacaoDoDiaResponse observacao = feedMonitorService.criarObservacao(id, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(observacao);
    }

    @PutMapping("/atividades/{fkContrato}/{fkCalendario}/{fkAtividade}")
    public ResponseEntity<AtividadeDoDiaResponse> atualizarAtividade(@PathVariable Long fkContrato,
                                                                     @PathVariable Long fkCalendario,
                                                                     @PathVariable Integer fkAtividade,
                                                                     @Valid @RequestBody AtividadeDoDiaRequest request) {
        AgendamentoId idDoAgendamento = new AgendamentoId(
                fkContrato,
                fkCalendario
        );
        AtividadeDoDiaId id = new AtividadeDoDiaId(
                idDoAgendamento,
                fkAtividade
        );

        AtividadeDoDiaResponse atividade = feedMonitorService.atualizarAtividade(id, request);

        return ResponseEntity.ok(atividade);
    }

    @PutMapping("/medicacoes/{id}")
    public ResponseEntity<MedicacaoDoDiaResponse> atualizarMedicacao(@PathVariable Long id,
                                                                     @Valid @RequestBody MedicacaoDoDiaRequest request) {
        MedicacaoDoDiaResponse medicacao = feedMonitorService.atualizarMedicacao(id, request);

        return ResponseEntity.ok(medicacao);
    }
}
