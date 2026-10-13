package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.dto.FeedMonitorDTO.*;
import br.com.ecodogpark.backend.service.FeedMonitorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PetFeedMonitorResponse> buscarPetParaMonitor(@PathVariable Long id) {
        PetFeedMonitorResponse pet = feedMonitorService.buscarPetParaMonitor(id);

        return ResponseEntity.ok(pet);
    }

    @GetMapping("/pet/{id}/atividades")
    public ResponseEntity<List<AtividadeDoPetResponse>> atividadesDoPet(@PathVariable Long id) {
        List<AtividadeDoPetResponse> atividades = feedMonitorService.buscarAtividades(id);

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

    @PutMapping("/pet/{idPet}/atividades/{idParticipacao}")
    public ResponseEntity<AtividadeDoPetResponse> atualizarAtividade(@PathVariable Long idPet,
                                                                     @PathVariable Long idParticipacao,
                                                                     @Valid @RequestBody AtividadeDoPetRequest request) {

        AtividadeDoPetResponse atividade = feedMonitorService.atualizarAtividade(idParticipacao, idPet, request);

        return ResponseEntity.ok(atividade);
    }

    @PutMapping("/pet/{idPet}/medicacoes/{idMedicacao}")
    public ResponseEntity<MedicacaoDoDiaResponse> atualizarMedicacao(@PathVariable Long idPet,
                                                                     @PathVariable Long idMedicacao,
                                                                     @Valid @RequestBody MedicacaoDoDiaRequest request) {
        MedicacaoDoDiaResponse medicacao = feedMonitorService.atualizarMedicacao(idMedicacao, idPet, request);

        return ResponseEntity.ok(medicacao);
    }
}
