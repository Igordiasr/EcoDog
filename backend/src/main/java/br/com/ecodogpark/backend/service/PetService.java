package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.Entity.PetEntity;
import br.com.ecodogpark.backend.Entity.UsuarioEntity;
import br.com.ecodogpark.backend.dto.PetRequestDto;
import br.com.ecodogpark.backend.dto.PetResponseDto;
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

    public PetResponseDto criar(PetRequestDto dto) {
        PetEntity pet = new PetEntity();
        preencher(pet, dto);
        return paraDto(petRepository.save(pet));
    }

    public List<PetResponseDto> listar() {
        return petRepository.findAll().stream().map(this::paraDto).toList();
    }

    public PetResponseDto buscarPorId(Long id) { return paraDto(obter(id)); }

    public PetResponseDto atualizar(Long id, PetRequestDto dto) {
        PetEntity pet = obter(id);
        preencher(pet, dto);
        return paraDto(petRepository.save(pet));
    }

    public void excluir(Long id) { petRepository.delete(obter(id)); }

    private PetEntity obter(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));
    }

    private UsuarioEntity obterTutor(Long tutorId) {
        return usuarioRepository.findById(tutorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado"));
    }

    private void preencher(PetEntity pet, PetRequestDto dto) {
        pet.setNome(dto.nome().trim());
        pet.setRaca(dto.raca());
        pet.setCastrado(dto.castrado());
        pet.setTutor(obterTutor(dto.tutorId()));
        pet.setIdade(dto.idade());
        pet.setRelacionamento(dto.relacionamento());
        pet.setVermifugo(dto.vermifugo());
        pet.setVacina(dto.vacina());
        pet.setAlergias(dto.alergias());
        pet.setSexo(dto.sexo());
        pet.setPlano(dto.plano());
        pet.setCuidadosEspeciais(dto.cuidadosEspeciais());
    }

    private PetResponseDto paraDto(PetEntity pet) {
        return new PetResponseDto(pet.getId(), pet.getNome(), pet.getRaca(), pet.getCastrado(),
                pet.getTutor().getId(), pet.getIdade(), pet.getRelacionamento(), pet.getVermifugo(),
                pet.getVacina(), pet.getAlergias(), pet.getSexo(), pet.getPlano(), pet.getCuidadosEspeciais());
    }
}
