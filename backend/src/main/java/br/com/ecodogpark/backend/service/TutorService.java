package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroPetRequest;
import br.com.ecodogpark.backend.exception.ConflitoAoCadastrarException;
import br.com.ecodogpark.backend.exception.DadosDivergentesException;
import br.com.ecodogpark.backend.exception.UsuarioNaoEncontradoException;
import br.com.ecodogpark.backend.mapper.PetMapper;
import br.com.ecodogpark.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class TutorService {
    private final PetRepository petRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicacoesDoPetRepository medicacoesDoPetRepository;
    private final VacinasDoPetRepository vacinasDoPetRepository;
    private final AlergiasDoPetRepository alergiasDoPetRepository;

    public TutorService(
            PetRepository petRepository,
            UsuarioRepository usuarioRepository,
            MedicacoesDoPetRepository medicacoesDoPetRepository,
            VacinasDoPetRepository vacinasDoPetRepository,
            AlergiasDoPetRepository alergiasDoPetRepository
    ) {
        this.petRepository = petRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicacoesDoPetRepository = medicacoesDoPetRepository;
        this.vacinasDoPetRepository = vacinasDoPetRepository;
        this.alergiasDoPetRepository = alergiasDoPetRepository;
    }

    public CadastroPetResponse cadastrarNovoPet(CadastroPetRequest cadastroPetRequest, Long idTutor) {
        if (!usuarioRepository.existsById(idTutor)) throw new UsuarioNaoEncontradoException("Tutor não encontrado");
        Optional<UsuariosEntity> tutor = usuarioRepository.findById(idTutor);

        if (petRepository.existsByFkUsuarioAndNome(tutor.get(), cadastroPetRequest.nome())) throw new ConflitoAoCadastrarException("Pet já cadastrado");
        PetsEntity pet = PetMapper.requestParaEntity(cadastroPetRequest);
        pet.setFkUsuario(tutor.get());

        NovoPetResponse novoPet = PetMapper.entityParaPetResponse(petRepository.save(pet));
        List<AlergiaParaListaResponse> alergiasDoPet = alergiasDoPetRepository.saveAll(PetMapper.alergiaDoPetParaEntity(cadastroPetRequest, pet))
                .stream().map(PetMapper::entityParaAlergiaParaLista).toList();
        List<VacinaParaListaResponse> vacinasDoPet = vacinasDoPetRepository.saveAll(PetMapper.vacinasDoPetParaEntity(cadastroPetRequest, pet))
                .stream().map(PetMapper::entityParaVacinaParaLista).toList();
        List<MedicacaoParaListaResponse> mediacacoesDoPet = medicacoesDoPetRepository.saveAll(PetMapper.medicacoesDoPetParaEntity(cadastroPetRequest, pet))
                .stream().map(PetMapper::entityParaMedicacaoParaLista).toList();
        return PetMapper.consolidarCadastroPet(novoPet, alergiasDoPet, mediacacoesDoPet, vacinasDoPet);
    }

    public List<PetParaListaResponse> buscarPorIdTutor(Long idTutor) {
        if (!usuarioRepository.existsById(idTutor)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado");
        Optional<UsuariosEntity> tutor = usuarioRepository.findById(idTutor);
        return petRepository.findByFkUsuario(tutor.get())
                .stream().map(PetMapper::entityParaPetParaLista).toList();
    }

    public NovoPetResponse atualizarDadosPet(Long idTutor, Long idPet, CadastroPetRequest cadastroPetRequest) {
        if (!usuarioRepository.existsById(idTutor)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado");
        Optional<UsuariosEntity> tutor = usuarioRepository.findById(idTutor);
        PetsEntity pet = PetMapper.requestParaEntity(cadastroPetRequest);
        pet.setIdPet(idPet);
        pet.setFkUsuario(tutor.get());
        return PetMapper.entityParaPetResponse(petRepository.save(pet));
    }

    @Transactional
    public void excluir(Long idTutor, Long idPet) {
        if (!usuarioRepository.existsById(idTutor)) throw new UsuarioNaoEncontradoException("Tutor não localizado");
        Optional<UsuariosEntity> tutor = usuarioRepository.findById(idTutor);
        if (!petRepository.existsByIdPetAndFkUsuario(idPet, tutor.get())) throw new DadosDivergentesException("ID do pet não pertence ao ID do tutor informado");
        petRepository.deleteById(idPet);
    }
}
