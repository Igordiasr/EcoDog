package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.CadastroPetResponse;
import br.com.ecodogpark.backend.dto.TutorDTO.response.NovoPetResponse;
import br.com.ecodogpark.backend.dto.TutorDTO.response.PetParaListaResponse;
import br.com.ecodogpark.backend.service.TutorService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Requisições tutor", description = "Endpoints para requisições relacionadas ao tutor")
@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "http://localhost:5173")
public class  TutorController {
    private final TutorService tutorService;

    public TutorController(TutorService tutorService) { this.tutorService = tutorService; }

    @Operation(summary = "Cadastra um novo pet", description = "Requisição para criar o cadastro de um novo pet através do identificador do tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pet cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
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
    public List<PetParaListaResponse> buscarPorId(
            @Parameter(description = "Identificador do tutor", example = "4")
            @PathVariable Long idTutor
    ) { return tutorService.buscarPorIdTutor(idTutor); }

    @Operation(summary = "Atualizar pet", description = "Requisição para atualizar os dados do pet e substituir suas medicações, vacinas e alergias, com base nos identificadores do tutor e do pet. Retorna o cadastro completo atualizado. O pet deve pertencer ao tutor informado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pet atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Atualização não permitida pois o pet não pertence ao tutor informado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor/ Pet não encontrado")
    })
    @PutMapping("/{idTutor}/{idPet}")
    public CadastroPetResponse atualizar(
            @Parameter(description = "Identificador do tutor", example = "4")
            @PathVariable Long idTutor,
            @Parameter(description = "Identificador do pet", example = "9")
            @PathVariable Long idPet,
            @Valid @RequestBody CadastroPetRequest cadastroPetRequest) {
        return tutorService.atualizarDadosPet(idTutor, idPet, cadastroPetRequest);
    }

    @Operation(summary = "Excluir pet", description = "Requisição para excluir o pet, como há muitas entidades relacionadas que dependem do registro do pet, essa exclusão é feita através de um soft delete para que as outras entidades não sejam afetadas")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Pet excluido com sucesso"),
            @ApiResponse(responseCode = "403", description = "Exclusão não permitida pois o identificador do pet não pertence ao identificador do tutor"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado")
    })
    @DeleteMapping("/{idTutor}/{idPet}")
    public ResponseEntity<Void> excluir(
            @Parameter(description = "Identificador do pet", example = "4")
            @PathVariable Long idPet,
            @Parameter(description = "Identificador do tutor", example = "9")
            @PathVariable Long idTutor
    ) {
        tutorService.excluir(idTutor ,idPet);
        return ResponseEntity.noContent().build();
    }
}
