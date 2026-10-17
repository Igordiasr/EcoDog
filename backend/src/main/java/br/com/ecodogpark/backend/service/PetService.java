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

    public PetResponse criar(PetRequest request) {
        PetsEntity pet = new PetsEntity();
        preencher(pet, request);
        return paraResponse(petRepository.save(pet));
    }

    public List<PetResponse> listar() {
        return petRepository.findAll().stream().map(this::paraResponse).toList();
    }

    public PetResponse buscarPorId(Long id) { return paraResponse(obter(id)); }

    public PetResponse atualizar(Long id, PetRequest request) {
        PetsEntity pet = obter(id);
        preencher(pet, request);
        return paraResponse(petRepository.save(pet));
    }

    public void excluir(Long id) { petRepository.delete(obter(id)); }

    private PetsEntity obter(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));
    }

    private UsuariosEntity obterTutor(Long idTutor) {
        return usuarioRepository.findById(idTutor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado"));
    }

    private void preencher(PetsEntity pet, PetRequest request) {
        pet.setNome(request.nome());
        pet.setRaca(request.raca());
        pet.setCastrado(request.castrado());
        pet.setFkUsuario(obterTutor(request.idTutor()));
        pet.setDataNascimento(request.dataNascimento());
        pet.setRelacaoComOutros(request.relacaoComOutros());
        pet.setSexo(request.sexo());
        pet.setObservacao(request.cuidadosEspeciais());
    }

    private PetResponse paraResponse(PetsEntity pet) {
        return new PetResponse(pet.getIdPet(), pet.getNome(), pet.getRaca(), pet.getCastrado(),
                pet.getFkUsuario().getIdUsuario(), pet.getDataNascimento(), pet.getRelacaoComOutros(),
                pet.getSexo(), pet.getObservacao());
    }
}
