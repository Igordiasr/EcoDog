package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.DiarioPetTutor.DataAgendadaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.DiarioPetTutor.DiarioPetResponse;
import br.com.ecodogpark.backend.service.DiarioPetService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Tag(name = "Requisições diário do pet", description = "Endpoints para consulta do diário e histórico dos pets")
@RestController
@RequestMapping("/diario")
@CrossOrigin(origins = "http://localhost:5173")
public class DiarioPetController {

    private static final ZoneId FUSO_HORARIO = ZoneId.of("America/Sao_Paulo");

    private final DiarioPetService diarioPetService;

    public DiarioPetController(DiarioPetService diarioPetService) {
        this.diarioPetService = diarioPetService;
    }

    @Operation(summary = "Consultar diário do pet", description = "Retorna resumo, atividades, medicações e observações da data solicitada. Se omitida, utiliza o dia atual em America/Sao_Paulo. Sem registros, retorna listas vazias.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso")
    })
    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping
    public ResponseEntity<DiarioPetResponse> obterDiarioDoPet(
            @Parameter(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestParam UUID idPet,
            @Parameter(description = "Data de referência (yyyy-MM-dd); quando omitida, utiliza o dia atual em America/Sao_Paulo", example = "2026-10-26")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        // O diário do pet sempre representa o dia solicitado; quando nenhuma data
        // é informada, utiliza-se a data atual (fuso America/Sao_Paulo), de modo
        // a não retornar dados de dias anteriores.
        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, data));
    }

    @Operation(summary = "Consultar as datas de agendamentos anteriores", description = "Retorna lista de datas de agendamentos anteriores com a situação 'CONFIRMADO' ou 'RETIRRADO'")
    @PreAuthorize("hasRole('TUTOR')")
    @GetMapping("/agendamentos/{idPet}")
    public ResponseEntity<List<DataAgendadaResponse>> buscarAgendamentosAnteriores(
            @Parameter(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID idPet
    ) {
        return ResponseEntity.ok(diarioPetService.obterAgendamentosAnteriores(idPet));
    }
}
