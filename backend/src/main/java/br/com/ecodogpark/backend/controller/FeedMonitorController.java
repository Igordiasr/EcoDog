package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.dto.FeedMonitorDTO.*;
import br.com.ecodogpark.backend.service.FeedMonitorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições feed do monitor", description = "Endpoints para acompanhamento de atividades, medicações e observações dos pets")
@RestController
@RequestMapping("/feed-monitor")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedMonitorController {
    private final FeedMonitorService feedMonitorService;

    public FeedMonitorController(FeedMonitorService feedMonitorService) {
        this.feedMonitorService = feedMonitorService;
    }

    @Operation(summary = "Buscar pet para monitor", description = "Consulta os dados do pet exibidos no feed do monitor.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pet, tutor ou agendamento confirmado do dia não encontrado", content = @Content)
    })
    @GetMapping("/pet/{id}")
    public ResponseEntity<PetFeedMonitorResponse> buscarPetParaMonitor(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        PetFeedMonitorResponse pet = feedMonitorService.buscarPetParaMonitor(id);
        return ResponseEntity.ok(pet);
    }

    @Operation(summary = "Listar atividades do pet", description = "Lista as participações do pet nas atividades do dia atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída; retorna lista vazia quando não há registros")
    })
    @GetMapping("/pet/{id}/atividades")
    public ResponseEntity<List<AtividadeDoPetResponse>> atividadesDoPet(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        List<AtividadeDoPetResponse> atividades = feedMonitorService.buscarAtividades(id);

        return ResponseEntity.ok(atividades);
    }

    @Operation(summary = "Listar medicações do pet", description = "Lista as medicações do pet para o dia atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída; retorna lista vazia quando não há registros")
    })
    @GetMapping("/pet/{id}/medicacoes")
    public ResponseEntity<List<MedicacaoDoDiaResponse>> medicacaoDoPet(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        List<MedicacaoDoDiaResponse> medicacoes = feedMonitorService.buscarMedicacao(id);

        return ResponseEntity.ok(medicacoes);
    }

    @Operation(summary = "Registrar observação do pet", description = "Registra uma observação para o agendamento confirmado do pet no dia atual.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Observação inválida", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado ou não confirmado", content = @Content)
    })
    @PostMapping("/pet/{id}/observacoes")
    public ResponseEntity<ObservacaoDoDiaResponse> criarObservacao(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id,
                                                                   @Valid @RequestBody ObservacaoDoDiaRequest request) {
        ObservacaoDoDiaResponse observacao = feedMonitorService.criarObservacao(id, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(observacao);
    }

    @Operation(summary = "Atualizar participação do pet", description = "Atualiza a participação na atividade. A situação deve ser PARTICIPOU ou NAO_PARTICIPOU; a não participação exige observação.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Situação inválida ou justificativa ausente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento ou participação não encontrado", content = @Content)
    })
    @PutMapping("/pet/{idPet}/atividades/{idParticipacao}")
    public ResponseEntity<AtividadeDoPetResponse> atualizarAtividade(@Parameter(description = "Identificador do pet", example = "1")
            @PathVariable Long idPet,
                                                                     @Parameter(description = "Identificador da participação do pet", example = "1")
            @PathVariable Long idParticipacao,
                                                                     @Valid @RequestBody AtividadeDoPetRequest request) {

        AtividadeDoPetResponse atividade = feedMonitorService.atualizarAtividade(idParticipacao, idPet, request);

        return ResponseEntity.ok(atividade);
    }

    @Operation(summary = "Atualizar medicação do pet", description = "Atualiza a aplicação da medicação. A situação deve ser TOMOU ou NAO_TOMOU; a não aplicação exige observação.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Situação inválida ou justificativa ausente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento ou medicação não encontrado", content = @Content)
    })
    @PutMapping("/pet/{idPet}/medicacoes/{idMedicacao}")
    public ResponseEntity<MedicacaoDoDiaResponse> atualizarMedicacao(@Parameter(description = "Identificador do pet", example = "1")
            @PathVariable Long idPet,
                                                                     @Parameter(description = "Identificador da medicação do dia", example = "1")
            @PathVariable Long idMedicacao,
                                                                     @Valid @RequestBody MedicacaoDoDiaRequest request) {
        MedicacaoDoDiaResponse medicacao = feedMonitorService.atualizarMedicacao(idMedicacao, idPet, request);

        return ResponseEntity.ok(medicacao);
    }
}
