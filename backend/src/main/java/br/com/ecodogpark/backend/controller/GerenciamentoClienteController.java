package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.VincularPlanoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.GerenciamentoClienteResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.PlanoDisponivelResponse;
import br.com.ecodogpark.backend.service.GerenciamentoClienteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(
        name = "Gerenciamento de clientes",
        description = "Endpoints para gerenciamento de contratos dos clientes"
)
@RestController
@RequestMapping("/gerenciamento-clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class GerenciamentoClienteController {

    private final GerenciamentoClienteService service;

    public GerenciamentoClienteController(
            GerenciamentoClienteService service
    ) {
        this.service = service;
    }

    @Operation(
            summary = "Listar clientes",
            description = "Lista os contratos dos tutores e permite pesquisar pelo nome."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Clientes encontrados"),
            @ApiResponse(responseCode = "204", description = "Nenhum cliente encontrado", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<GerenciamentoClienteResponse>> listarClientes(
            @Parameter(
                    description = "Nome do tutor utilizado na pesquisa",
                    example = "Viviane"
            )
            @RequestParam(required = false) String pesquisa
    ) {
        List<GerenciamentoClienteResponse> clientes =
                service.listarClientes(pesquisa);

        if (clientes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(clientes);
    }

    @Operation(
            summary = "Listar planos disponíveis",
            description = "Retorna os serviços ativos que podem ser vinculados aos contratos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Planos encontrados")
    })
    @GetMapping("/planos")
    public ResponseEntity<List<PlanoDisponivelResponse>> listarPlanos() {
        return ResponseEntity.ok(service.listarPlanos());
    }

    @Operation(
            summary = "Editar contrato",
            description = "Atualiza as datas e o valor de um contrato."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contrato atualizado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Contrato não encontrado", content = @Content)
    })
    @PutMapping("/{idContrato}")
    public ResponseEntity<GerenciamentoClienteResponse> atualizarContrato(
            @Parameter(description = "Identificador do contrato", example = "1")
            @PathVariable Long idContrato,
            @Valid @RequestBody AtualizarContratoRequest requisicao
    ) {
        return ResponseEntity.ok(
                service.atualizarContrato(idContrato, requisicao)
        );
    }

    @Operation(
            summary = "Alterar status do contrato",
            description = "Ativa ou desativa um contrato sem desativar a conta do tutor."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status atualizado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Contrato não encontrado", content = @Content)
    })
    @PatchMapping("/{idContrato}/status")
    public ResponseEntity<GerenciamentoClienteResponse> alterarStatus(
            @Parameter(description = "Identificador do contrato", example = "1")
            @PathVariable Long idContrato,
            @Valid @RequestBody AlterarStatusContratoRequest requisicao

    ) {
        return ResponseEntity.ok(
                service.alterarStatus(idContrato, requisicao)
        );
    }

    @Operation(
            summary = "Vincular plano ao contrato",
            description = "Associa um serviço ativo ao contrato e atualiza seu valor."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Plano vinculado"),
            @ApiResponse(responseCode = "400", description = "Plano inativo ou dados inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Contrato ou plano não encontrado", content = @Content)
    })
    @PutMapping("/{idContrato}/plano")
    public ResponseEntity<GerenciamentoClienteResponse> vincularPlano(
            @Parameter(description = "Identificador do contrato", example = "1")
            @PathVariable Long idContrato,
            @Valid @RequestBody VincularPlanoRequest requisicao
    ) {
        return ResponseEntity.ok(
                service.vincularPlano(idContrato, requisicao)
        );
    }
}