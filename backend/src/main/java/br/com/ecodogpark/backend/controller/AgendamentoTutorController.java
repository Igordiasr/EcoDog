package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.service.AgendamentoTutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições agendamentos do tutor", description = "Endpoints para consulta de vagas, orçamento, contratação, agendamento pelo plano e cancelamento pelo tutor")
@RestController
@RequestMapping("/calendario")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoTutorController {
    private final AgendamentoTutorService agendamentoTutorService;

    public AgendamentoTutorController(AgendamentoTutorService agendamentoTutorService) {
        this.agendamentoTutorService = agendamentoTutorService;
    }

    @Operation(summary = "Listar pets do tutor", description = "Busca os pets associados ao tutor para seleção no agendamento. Retorna lista vazia quando não há pets.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso")
    })
    @GetMapping("/pets")
    public ResponseEntity<List<PetsDoTutorResponse>> buscarPets(
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.buscarPets(idUsuario));
    }

    @Operation(summary = "Consultar disponibilidade mensal", description = "Lista a capacidade e as vagas livres de cada dia do mês para CRECHE, DAYUSE ou HOTEL.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso"),
            @ApiResponse(responseCode = "400", description = "Categoria inválida ou parâmetros obrigatórios ausentes ou em formato inválido", content = @Content)
    })
    @GetMapping("/disponibilidade")
    public ResponseEntity<List<VagasDisponiveisResponse>> buscarDisponibilidade(
            @Parameter(description = "Categoria do serviço: CRECHE, DAYUSE ou HOTEL", example = "CRECHE")
            @RequestParam String servico,
            @Parameter(description = "Ano da consulta", example = "2026")
            @RequestParam Integer ano,
            @Parameter(description = "Mês da consulta, de 1 a 12", example = "11")
            @RequestParam Integer mes) {
        List<VagasDisponiveisResponse> disponibilidade = agendamentoTutorService.buscarDisponibilidade(servico, ano, mes);
        return ResponseEntity.ok(disponibilidade);
    }

    @Operation(summary = "Listar agendamentos do tutor", description = "Consulta os agendamentos dos pets do tutor no mês informado, com situação AGENDADO ou CONFIRMADO. Retorna lista vazia quando não há registros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso")
    })
    @GetMapping("/tutor/agendamentos")
    public ResponseEntity<List<AgendamentosTutorResponse>> buscarAgendamentos(
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario,
            @Parameter(description = "Ano da consulta", example = "2026")
            @RequestParam Integer ano,
            @Parameter(description = "Mês da consulta, de 1 a 12", example = "11")
            @RequestParam Integer mes) {
        return ResponseEntity.ok(agendamentoTutorService.buscarAgendamentosDoTutor(idUsuario, ano, mes));
    }

    @Operation(summary = "Listar serviços ativos", description = "Lista os serviços ativos da categoria CRECHE, DAYUSE ou HOTEL disponíveis para contratação.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso"),
            @ApiResponse(responseCode = "400", description = "Categoria inválida ou ausente", content = @Content)
    })
    @GetMapping("/servicos")
    public ResponseEntity<List<ServicoAtivoResponse>> buscarServicos(
            @Parameter(description = "Categoria do serviço: CRECHE, DAYUSE ou HOTEL", example = "CRECHE")
            @RequestParam String categoria) {
        List<ServicoAtivoResponse> servicos = agendamentoTutorService.listarServicos(categoria);
        return ResponseEntity.ok(servicos);
    }

    @Operation(summary = "Calcular orçamento", description = "Calcula o valor total do serviço para os pets e datas selecionados, sem criar agendamentos. Para PLANO, utiliza a data inicial para definir as datas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Serviço, pets ou datas obrigatórios ausentes ou inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Um ou mais pets não pertencem ao tutor", content = @Content),
            @ApiResponse(responseCode = "404", description = "Serviço não encontrado ou inativo", content = @Content)
    })
    @PostMapping("/orcamentos")
    public ResponseEntity<OrcamentoResponse> criarOrcamento(@RequestBody @Valid OrcamentoRequest request,
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.calcularOrcamento(request, idUsuario));
    }

    @Operation(summary = "Contratar serviço e criar agendamentos", description = "Contrata o serviço para os pets do tutor. Para serviços por dia, cria os agendamentos nas datas selecionadas; para PLANO, utiliza a data de início. Valida vagas, duplicidades e conflitos de planos.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Serviço, pets ou datas obrigatórios ausentes ou inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Um ou mais pets não pertencem ao tutor", content = @Content),
            @ApiResponse(responseCode = "404", description = "Serviço não encontrado ou inativo", content = @Content),
            @ApiResponse(responseCode = "409", description = "Vagas insuficientes, agendamento duplicado ou plano em conflito", content = @Content)
    })
    @PostMapping("/agendamentos")
    public ResponseEntity<AgendamentoCriadoResponse> agendar(@RequestBody @Valid OrcamentoRequest request,
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.criarAgendamento(request, idUsuario));
    }

    @Operation(summary = "Agendar utilizando plano vigente", description = "Agenda creche para os pets e datas selecionados utilizando o plano vigente. Valida as vagas e o limite semanal, retornando os saldos após o agendamento.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Pets ou datas ausentes ou inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Um ou mais pets não pertencem ao tutor", content = @Content),
            @ApiResponse(responseCode = "409", description = "Plano vigente ausente, vagas insuficientes, agendamento duplicado ou limite semanal excedido", content = @Content)
    })
    @PostMapping("/planos/agendamentos")
    public ResponseEntity<AgendamentoPlanoResponse> agendarPeloPlano(@RequestBody @Valid OrcamentoRequest request,
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoTutorService.agendarPeloPlano(request, idUsuario));
    }

    @Operation(summary = "Cancelar agendamento", description = "Cancela um agendamento pertencente ao tutor, nas situações AGENDADO ou CONFIRMADO. Não permite datas passadas. Quando o dia utiliza saldo do plano, devolve a utilização ao saldo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Não é possível cancelar datas passadas", content = @Content),
            @ApiResponse(responseCode = "403", description = "Agendamento não pertence ao tutor", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Situação do agendamento não permite cancelamento", content = @Content)
    })
    @PatchMapping("/agendamentos/{idAgendamento}/cancelar")
    public ResponseEntity<CancelamentoResponse> cancelar(
            @Parameter(description = "Identificador do agendamento a cancelar", example = "1")
            @PathVariable Long idAgendamento,
            @Parameter(description = "Identificador do tutor", example = "4")
            @RequestParam Long idUsuario) {
        return ResponseEntity.ok(agendamentoTutorService.cancelarAgendamento(idAgendamento, idUsuario));
    }
}
