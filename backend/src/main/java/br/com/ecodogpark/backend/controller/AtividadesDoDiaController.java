package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response.AtividadesDoDiaResponse;
import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.request.AtualizarAtividadeRequest;
import br.com.ecodogpark.backend.service.AtividadesDoDiaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições atividades do dia", description = "Endpoints para requisições relacionadas a visualização e conclusão das atividades que serão executadas pelos pets para o dia atual")
@RestController
@RequestMapping("/atividades")
@CrossOrigin(origins = "http://localhost:5173")
public class AtividadesDoDiaController {
    private final AtividadesDoDiaService atividadesDoDiaService;

    public AtividadesDoDiaController(AtividadesDoDiaService atividadesDoDiaService) {
        this.atividadesDoDiaService = atividadesDoDiaService;
    }

    @Operation(summary = "Listar atividades", description = "Requisição que busca e lista as atividades que serão realizadas no dia, dividindo os pets em grupos pré-definidos")
    @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso")
    @GetMapping
    public ResponseEntity<AtividadesDoDiaResponse> buscarAtividadesDoDia() {
        return ResponseEntity.ok(atividadesDoDiaService.buscarAtividadesDoDia());
    }

    @Operation(summary = "Concluir atividade", description = "Requisição que altera a situação de uma atividade para 'CONCLUIDA'. A requisição é realizada através do identificador da atividade do dia")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Alteração realizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Atividade do dia não encontrada")
    })
    @PutMapping
    public ResponseEntity<Void> concluirAtividade(@RequestBody @Valid AtualizarAtividadeRequest atividade) {
        atividadesDoDiaService.concluirAtividade(atividade.situacao(), atividade.idAtividadeDoDia());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Atualizar participação dos pets", description = "Requisição que altera a situação da participação dos pets relacionados a uma atividade do dia para 'PARTICIPOU'. A alteração só é realizada caso a situação esteja como 'PENDENTE' e é necessário informar uma lista de identificadores de participação do dia")
    @ApiResponse(responseCode = "204", description = "Alteração realizada com sucesso")
    @PutMapping("/atualizarPets")
    public ResponseEntity<Void> concluirAtividadeTodosPets(@RequestBody List<Long> idsParticipacoes) {
        atividadesDoDiaService.concluirAtividadeTodosPets(idsParticipacoes);
        return ResponseEntity.noContent().build();
    }
}
