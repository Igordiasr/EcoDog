package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TutorDTO.request.*;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.service.TutorService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Requisições tutor", description = "Endpoints para requisições relacionadas ao tutor")
@RestController
@RequestMapping("/tutores")
@CrossOrigin(origins = "http://localhost:5173")
public class  TutorController {
    private final TutorService tutorService;

    public TutorController(TutorService tutorService) { this.tutorService = tutorService; }

    @Operation(summary = "Cadastra um novo tutor", description = "Requisição para criar o cadastro de um novo tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tutor cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Tutor já cadastrado", content = @Content)
    })
    @PostMapping
    public ResponseEntity<TutorCadastroResponse> cadastrarTutor(@Valid @RequestBody CadastroTutorRequest tutorRequest) {
        TutorCadastroResponse tutor = tutorService.cadastrarTutor(tutorRequest);
        return ResponseEntity.created(URI.create("/tutores/" + tutor.id())).body(tutor);
    }

    @Operation(summary = "Consulta os dados do tutor", description = "Requisição para consultar os dados cadastrais de um tutor através do seu identificador")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do tutor encontrados com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content)
    })
    @GetMapping("/conta/{idTutor}")
    public ResponseEntity<MeusDadosResponse> dadosTutor(@PathVariable UUID idTutor) {
        MeusDadosResponse dadosTutor = tutorService.buscarDados(idTutor);
        return ResponseEntity.ok(dadosTutor);
    }

    @Operation(summary = "Atualiza os dados do tutor", description = "Requisição para atualizar os dados cadastrais de um tutor através do seu identificador")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do tutor atualizados com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Dados informados já estão cadastrados", content = @Content)
    })
    @PutMapping("/conta/{idTutor}")
    public ResponseEntity<MeusDadosResponse> atualizarTutor(@Valid @RequestBody AtualizarDadosRequest requestTutor,
                                                            @PathVariable UUID idTutor) {
        MeusDadosResponse dadosAtualizados = tutorService.atualizarDados(idTutor, requestTutor);
        return ResponseEntity.ok(dadosAtualizados);
    }

    @Operation(summary = "Listar pets", description = "Requisição para buscar uma lista com todos os pets cadastrados e associados ao identificador do tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pets encontrados, ou lista vazia"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado")
    })
    @GetMapping("/{idTutor}/pets")
    public List<PetParaListaResponse> listarPets(
            @Parameter(description = "Identificador do tutor", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID idTutor
    ) { return tutorService.listarPets(idTutor); }

    @Operation(summary = "Lista as alergias cadastradas", description = "Requisição para listar todas as alergias disponíveis no catálogo compartilhado entre os tutores")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Alergias listadas com sucesso")})
    @GetMapping("/alergias")
    public ResponseEntity<List<AlergiaResponse>> catalogoAlergias() {
        return ResponseEntity.ok(tutorService.listarAlergias());
    }

    @Operation(summary = "Lista as medicações cadastradas", description = "Requisição para listar todas as medicações disponíveis no catálogo compartilhado entre os tutores")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Medicações listadas com sucesso")})
    @GetMapping("/medicacoes")
    public ResponseEntity<List<MedicacaoResponse>> catalogoMedicacoes() {
        return ResponseEntity.ok(tutorService.listarMedicacoes());
    }

    @Operation(summary = "Lista as vacinas cadastradas", description = "Requisição para listar todas as vacinas disponíveis no catálogo compartilhado entre os tutores")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Vacinas listadas com sucesso")})
    @GetMapping("/vacinas")
    public ResponseEntity<List<VacinaResponse>> catalogoVacinas() {
        return ResponseEntity.ok(tutorService.listarVacinas());
    }

    @Operation(summary = "Cadastra um novo pet", description = "Requisição para criar o cadastro de um novo pet através do identificador do tutor")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pet cadastrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Pet já cadastrado", content = @Content)
    })
    @PostMapping("/{idTutor}/pets")
        public ResponseEntity<CadastroPetResponse> cadastrarNovoPet(
            @Valid @RequestBody CadastroPetRequest cadastroPetRequest,
            @Parameter(description = "Identificador do tutor", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID idTutor
    ) {
        CadastroPetResponse pet = tutorService.cadastrarNovoPet(cadastroPetRequest, idTutor);
        return ResponseEntity.created(URI.create("/pets/" + pet.idPet())).body(pet);
    }

    @Operation(summary = "Atualizar pet", description = "Requisição para atualizar os dados do pet e substituir suas medicações, vacinas e alergias, com base nos identificadores do tutor e do pet. Retorna o cadastro completo atualizado. O pet deve pertencer ao tutor informado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pet atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Atualização não permitida pois o pet não pertence ao tutor informado", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tutor/ Pet não encontrado")
    })
    @PutMapping("/{idTutor}/pets/{idPet}")
    public CadastroPetResponse atualizar(
            @Parameter(description = "Identificador do tutor", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID idTutor,
            @Parameter(description = "Identificador do pet", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID idPet,
            @Valid @RequestBody CadastroPetRequest cadastroPetRequest) {
        return tutorService.atualizarDadosPet(idTutor, idPet, cadastroPetRequest);
    }

    @Operation(summary = "Excluir pet", description = "Requisição para excluir o pet, como há muitas entidades relacionadas que dependem do registro do pet, essa exclusão é feita através de um soft delete para que as outras entidades não sejam afetadas")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Pet excluido com sucesso"),
            @ApiResponse(responseCode = "403", description = "Exclusão não permitida pois o identificador do pet não pertence ao identificador do tutor"),
            @ApiResponse(responseCode = "404", description = "Tutor não encontrado")
    })
    @DeleteMapping("/{idTutor}/pets/{idPet}")
    public ResponseEntity<Void> excluir(
            @Parameter(description = "Identificador do pet", example = "68736f5d-7587-51fc-9101-46a148dc4852")
            @PathVariable UUID idPet,
            @Parameter(description = "Identificador do tutor", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID idTutor
    ) {
        tutorService.excluir(idTutor ,idPet);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Busca os agendamentos dos Pets de um tutor")
    @ApiResponse(responseCode = "200", description = "Agendamentos encontrados")
    @GetMapping("/{idTutor}/agendamentos")
    public ResponseEntity<List<MeusAgendamentosResponse>> meusAgendamentos(@PathVariable UUID idTutor) {
        return ResponseEntity.ok(tutorService.buscarAgendamentos(idTutor));
    }

    @Operation(summary = "Cadastra uma nova alergia",
            description = "Requisição para cadastrar uma nova alergia no catálogo compartilhado entre os tutores")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Alergia cadastrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Alergia já cadastrada", content = @Content)
    })
    @PostMapping("/alergias")
    public ResponseEntity<AlergiaResponse> cadastrarNovaAlergia(@Valid @RequestBody AlergiaRequest request) {
        AlergiaResponse response = tutorService.cadastrarNovaAlergia(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Cadastra uma nova medicação",
            description = "Requisição para cadastrar uma nova medicação no catálogo compartilhado entre os tutores")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Medicação cadastrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Medicação já cadastrada", content = @Content)
    })
    @PostMapping("/medicacoes")
    public ResponseEntity<MedicacaoResponse> cadastrarNovaMedicacao(@Valid @RequestBody MedicacaoRequest request) {
        MedicacaoResponse response = tutorService.cadastrarNovaMedicacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Cadastra uma nova vacina",
            description = "Requisição para cadastrar uma nova vacina no catálogo compartilhado entre os tutores")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Vacina cadastrada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Informa quais dados estão inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Vacina já cadastrada", content = @Content)
    })
    @PostMapping("/vacinas")
    public ResponseEntity<VacinaResponse> cadastrarNovaVacina(@Valid @RequestBody VacinaRequest request) {
        VacinaResponse response = tutorService.cadastrarNovaVacina(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
