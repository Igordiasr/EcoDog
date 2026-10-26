package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.DiarioPetResponse;
import br.com.ecodogpark.backend.service.DiarioPetService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;

@Tag(name = "Requisições diário do pet", description = "Endpoints para consulta do diário e histórico dos pets")
@RestController
@RequestMapping("/api/diario")
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
    @GetMapping("/{idPet}")
    public ResponseEntity<DiarioPetResponse> obterDiarioDoPet(
            @Parameter(description = "Identificador do pet", example = "1")
            @PathVariable Long idPet,
            @Parameter(description = "Data de referência (yyyy-MM-dd); quando omitida, utiliza o dia atual em America/Sao_Paulo", example = "2026-10-26")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        // O diário do pet sempre representa o dia solicitado; quando nenhuma data
        // é informada, utiliza-se a data atual (fuso America/Sao_Paulo), de modo
        // a não retornar dados de dias anteriores.
        LocalDate dataReferencia = data != null ? data : LocalDate.now(FUSO_HORARIO);
        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, dataReferencia));
    }

    // Funcionalidade explícita de histórico: permite consultar o diário de um pet
    // em uma data específica, sem alterar o comportamento do diário do dia.
    @Operation(summary = "Consultar histórico do pet", description = "Retorna o diário do pet para uma data específica, informada obrigatoriamente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Data ausente ou inválida", content = @Content)
    })
    @GetMapping("/{idPet}/historico")
    public ResponseEntity<DiarioPetResponse> obterHistoricoDoPet(
            @Parameter(description = "Identificador do pet", example = "1")
            @PathVariable Long idPet,
            @Parameter(description = "Data de referência (yyyy-MM-dd)", example = "2026-10-26")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        return ResponseEntity.ok(diarioPetService.obterDiarioDoPet(idPet, data));
    }
}
