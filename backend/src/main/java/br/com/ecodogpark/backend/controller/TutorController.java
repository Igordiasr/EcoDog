package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.CadastroPetResponse;
import br.com.ecodogpark.backend.dto.TutorDTO.response.NovoPetResponse;
import br.com.ecodogpark.backend.dto.TutorDTO.response.PetParaListaResponse;
import br.com.ecodogpark.backend.service.TutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Requisições tutor", description = "Endpoints para requisições relacionadas ao tutor")
@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "http://localhost:5173")
public class TutorController {
    private final TutorService tutorService;

    public TutorController(TutorService tutorService) { this.tutorService = tutorService; }

    @Operation(summary = "Cadastra um novo pet", description = "Requisição para criar o cadastro de um novo pet através do identificador do tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pet cadastrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Pet já cadastrado", content = @Content)
    })
    @PostMapping("/{idTutor}")
    public ResponseEntity<CadastroPetResponse> cadastrarNovoPet(
            @Valid @RequestBody CadastroPetRequest cadastroPetRequest,
            @Parameter(description = "Identificador do tutor", example = "4")
            @PathVariable Long idTutor
    ) {
        CadastroPetResponse pet = tutorService.cadastrarNovoPet(cadastroPetRequest, idTutor);
        return ResponseEntity.created(URI.create("/pets/" + pet.idPet())).body(pet);
    }

    @Operation(summary = "Listar pets", description = "Requisição para buscar uma lista com todos os pets cadastrados e associados ao identificador do tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pets encontrados, ou lista vazia"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado")
    })
    @GetMapping("/{idTutor}")
    public List<PetParaListaResponse> buscarPorId(@PathVariable Long idTutor) { return tutorService.buscarPorIdTutor(idTutor); }

    @Operation(summary = "Atualizar pet", description = "Requisição para atualizar o pet com base no identificador do tutor e no identificador do pet")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pet atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado"),
            @ApiResponse(responseCode = "404", description = "Pet não encontrado")
    })
    @PutMapping("/{idTutor}/{idPet}")
    public NovoPetResponse atualizar(@PathVariable Long idTutor, @PathVariable Long idPet, @Valid @RequestBody CadastroPetRequest cadastroPetRequest) {
        return tutorService.atualizarDadosPet(idTutor, idPet, cadastroPetRequest);
    }

    @DeleteMapping("/{idTutor}/{idPet}")
    public ResponseEntity<Void> excluir(@PathVariable Long idPet, @PathVariable Long idTutor) {
        tutorService.excluir(idTutor ,idPet);
        return ResponseEntity.noContent().build();
    }
}
