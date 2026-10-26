package br.com.ecodogpark.backend.controller;

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

@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "http://localhost:5173")
public class  TutorController {
    private final TutorService tutorService;

    public TutorController(TutorService tutorService) { this.tutorService = tutorService; }

    @PostMapping("/{idTutor}")
    public ResponseEntity<CadastroPetResponse> cadastrarNovoPet(@Valid @RequestBody CadastroPetRequest cadastroPetRequest, @PathVariable Long idTutor) {
        CadastroPetResponse pet = tutorService.cadastrarNovoPet(cadastroPetRequest, idTutor);
        return ResponseEntity.created(URI.create("/pets/" + pet.idPet())).body(pet);
    }

    @GetMapping("/{idTutor}")
    public List<PetParaListaResponse> buscarPorId(@PathVariable Long idTutor) { return tutorService.buscarPorIdTutor(idTutor); }

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
