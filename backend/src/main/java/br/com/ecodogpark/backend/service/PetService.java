package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.dto.PetRequest;
import br.com.ecodogpark.backend.dto.PetResponse;
import br.com.ecodogpark.backend.repository.PetRepository;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PetService {
    private final PetRepository petRepository;
    private final UsuarioRepository usuarioRepository;

    public PetService(PetRepository petRepository, UsuarioRepository usuarioRepository) {
        this.petRepository = petRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public PetResponse criar(PetRequest dto) {
        PetsEntity pet = new PetsEntity();
        preencher(pet, dto);
        return paraDto(petRepository.save(pet));
    }

    public List<PetResponse> listar() {
        return petRepository.findAll().stream().map(this::paraDto).toList();
    }

    public PetResponse buscarPorId(Long id) { return paraDto(obter(id)); }

    public PetResponse atualizar(Long id, PetRequest dto) {
        PetsEntity pet = obter(id);
        preencher(pet, dto);
        return paraDto(petRepository.save(pet));
    }

    public void excluir(Long id) { petRepository.delete(obter(id)); }

    private PetsEntity obter(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));
    }

    private UsuariosEntity obterTutor(Long tutorId) {
        return usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado"));
    }

    private void preencher(PetsEntity pet, PetRequest dto) {
        pet.setNome(dto.nome());
        pet.setRaca(dto.raca());
        pet.setCastrado(dto.castrado());
        pet.setFkUsuario(obterTutor(dto.tutorId()));
        pet.setDataNascimento(dto.dataNascimento());
        pet.setRelacaoComOutros(dto.relacaoComOutros());
        pet.setSexo(dto.sexo());
        pet.setObservacao(dto.cuidadosEspeciais());
    }

    private PetResponse paraDto(PetsEntity pet) {
        return new PetResponse(pet.getIdPet(), pet.getNome(), pet.getRaca(), pet.getCastrado(),
                pet.getFkUsuario().getIdUsuario(), pet.getDataNascimento(), pet.getRelacaoComOutros(),
                pet.getSexo(), pet.getObservacao());
    }
}
