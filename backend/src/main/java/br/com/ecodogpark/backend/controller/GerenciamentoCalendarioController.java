package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.service.GerenciamentoCalendarioService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Tag(name = "Requisições calendário", description = "Endpoints para configuração de vagas e atividades por dia")
@RestController
@RequestMapping("/calendario")
@CrossOrigin(origins = "http://localhost:5173")
public class GerenciamentoCalendarioController {
    private final GerenciamentoCalendarioService servico;

    public GerenciamentoCalendarioController(GerenciamentoCalendarioService servico) {
        this.servico = servico;
    }

    @Operation(summary = "Listar dias configurados", description = "Lista as datas configuradas no calendário para o mês informado no formato yyyy-MM.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Mês ausente ou inválido", content = @Content)
    })
    @GetMapping("/dias")
    public ResponseEntity<List<LocalDate>> listarDiasConfigurados(
            @Parameter(description = "Mês de referência (yyyy-MM)", example = "2026-10")
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes) {
        return ResponseEntity.ok(servico.listarDiasConfigurados(mes));
    }

    @Operation(summary = "Consultar calendário do dia", description = "Retorna vagas, atividades e pets agendados. Dias não configurados retornam identificador nulo, vagas zeradas e atividades vazias.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Data ausente ou inválida", content = @Content)
    })
    @GetMapping("/dia")
    public ResponseEntity<CalendarioDiaResponse> buscarDia(
            @Parameter(description = "Data de referência (yyyy-MM-dd)", example = "2026-10-26")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(servico.buscarDia(data));
    }

    @Operation(summary = "Listar catálogo de atividades", description = "Lista as atividades disponíveis por nome. Os campos de programação do dia são nulos.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso")
    })
    @GetMapping("/catalogo-atividades")
    public ResponseEntity<List<AtividadeCalendarioResponse>> listarCatalogoAtividades() {
        return ResponseEntity.ok(servico.listarCatalogoAtividades());
    }

    @Operation(summary = "Atualizar vagas do dia", description = "Define as vagas de creche e hotel. Cria o calendário da data quando ainda não existir.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Data inválida ou quantidade de vagas negativa ou ausente", content = @Content)
    })
    @PutMapping("/{data}/vagas")
    public ResponseEntity<CalendarioDiaResponse> atualizarVagas(
            @Parameter(description = "Data de referência (yyyy-MM-dd)", example = "2026-10-26")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Valid @RequestBody VagasCalendarioRequest requisicao) {
        return ResponseEntity.ok(servico.atualizarVagas(data, requisicao));
    }

    @Operation(summary = "Programar atividade", description = "Adiciona uma atividade do catálogo ao dia. O horário final deve ser posterior ao inicial e não pode haver sobreposição de horários.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou horário final anterior ou igual ao inicial", content = @Content),
            @ApiResponse(responseCode = "404", description = "Atividade do catálogo não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Horário em conflito com outra atividade do dia", content = @Content)
    })
    @PostMapping("/{data}/atividades")
    public ResponseEntity<AtividadeCalendarioResponse> adicionarAtividade(
            @Parameter(description = "Data de referência (yyyy-MM-dd)", example = "2026-10-26")
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Valid @RequestBody AdicionarAtividadeCalendarioRequest requisicao) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servico.adicionarAtividade(data, requisicao));
    }

    @Operation(summary = "Remover atividade programada", description = "Exclui uma atividade do dia desde que não existam pets vinculados.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "404", description = "Atividade programada não encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "Atividade possui pets vinculados", content = @Content)
    })
    @DeleteMapping("/atividades/{id}")
    public ResponseEntity<Void> removerAtividade(@Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id) {
        servico.removerAtividade(id);
        return ResponseEntity.noContent().build();
    }
}
