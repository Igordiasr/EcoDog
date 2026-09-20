package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.PetRequestDto;
import br.com.ecodogpark.backend.dto.PetResponseDto;
import br.com.ecodogpark.backend.service.PetService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "http://localhost:5173")
public class PetController {
    private final PetService petService;

    public PetController(PetService petService) { this.petService = petService; }

    @PostMapping
    public ResponseEntity<PetResponseDto> criar(@Valid @RequestBody PetRequestDto dto) {
        PetResponseDto pet = petService.criar(dto);
        return ResponseEntity.created(URI.create("/pets/" + pet.id())).body(pet);
    }

    @GetMapping
    public List<PetResponseDto> listar() { return petService.listar(); }

    @GetMapping("/{id}")
    public PetResponseDto buscarPorId(@PathVariable Long id) { return petService.buscarPorId(id); }

    @PutMapping("/{id}")
    public PetResponseDto atualizar(@PathVariable Long id, @Valid @RequestBody PetRequestDto dto) {
        return petService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        petService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
