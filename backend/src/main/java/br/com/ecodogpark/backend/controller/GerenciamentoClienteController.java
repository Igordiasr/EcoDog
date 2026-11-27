package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarValorContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.VincularPlanoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.*;
import br.com.ecodogpark.backend.service.GerenciamentoClienteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(
        name = "Requisições gerenciamento de clientes",
        description = "Consulta de pets e gerenciamento de contratos de serviços"
)
@RestController
@RequestMapping("/gerenciamento-clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class GerenciamentoClienteController {

    private final GerenciamentoClienteService service;

    public GerenciamentoClienteController(GerenciamentoClienteService service) {
        this.service = service;
    }

    @Operation(
            summary = "Listar clientes", description = "Retorna pets agrupados com seus contratos ativos e vigentes. A pesquisa considera somente o nome do pet ou o nome do tutor.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum resultado encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<PetGerenciamentoResponse>> buscarContratos(
            @Parameter(description = "Nome do pet ou nome do tutor para pesquisa", example = "Bob")
            @RequestParam(required = false) String pesquisa
    ) {
        List<PetGerenciamentoResponse> resposta = service.buscarContratos(pesquisa);

        if (resposta.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resposta);
    }

    @Operation(summary = "Listar planos disponíveis", description = "Retorna os serviços ativos disponíveis para vinculação dos contratos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Planos retornados com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum plano disponível", content = @Content)
    })
    @GetMapping("/planos")
    public ResponseEntity<List<PlanoDisponivelResponse>> listarPlanos() {

        List<PlanoDisponivelResponse> resposta = service.listarPlanos();

        if (resposta.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resposta);
    }

    @Operation( summary = "Listar tutores disponíveis", description = "Retorna os tutores ativos para seleção no gerenciamento de clientes."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tutores retornados com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum tutor disponível", content = @Content)
    })
    @GetMapping("/tutores")
    public ResponseEntity<List<TutorDisponivelResponse>> listarTutores() {
        List<TutorDisponivelResponse> resposta = service.listarTutores();
        if (resposta.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resposta);
    }

    @Operation(summary = "Listar pets de um tutor", description = "Retorna o ID e o nome dos pets vinculados ao tutor informado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pets retornados com sucesso"),
            @ApiResponse(responseCode = "204", description = "Nenhum pet encontrado para o tutor", content = @Content)
    })
    @GetMapping("/tutores/{idTutor}/pets")
    public ResponseEntity<List<VincularPetResponse>> listarPetsDoTutor(

            @Parameter(description = "ID do tutor", example = "061ac032-803c-5b03-802c-2f597eb6976a")
            @PathVariable UUID idTutor
    ) {
        List<VincularPetResponse> resposta = service.listarPetsDoTutor(idTutor);
        if (resposta.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resposta);
    }

    @Operation(
            summary = "Atualizar valor do contrato", description = "Atualiza o valor de um contrato existente."
    )
    @PutMapping("/contratos/{idContrato}")
    public ResponseEntity<Void> atualizarContrato(
            @PathVariable Long idContrato,
            @Valid @RequestBody AtualizarValorContratoRequest request
    ) {
        service.atualizarContrato(idContrato, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Alterar status do contrato", description = "Altera o status de um contrato existente. Ex: ENCERRADO")
    @PatchMapping("/contratos/{idContrato}/status")
    public ResponseEntity<Void> alterarStatusContrato(
            @PathVariable Long idContrato,
            @Valid @RequestBody AlterarStatusContratoRequest request
    ) {
        service.alterarStatusContrato(idContrato, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/contratos")
    public ResponseEntity<VincularPlanoResponse> vincularPlano(@Valid @RequestBody VincularPlanoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.vincularPlano(request));
    }



}

