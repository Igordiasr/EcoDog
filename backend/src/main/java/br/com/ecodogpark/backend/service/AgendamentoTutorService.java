package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.PetsDoTutorResponse;
import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.repository.AgendamentosRepository;
import br.com.ecodogpark.backend.repository.CalendarioRepository;
import br.com.ecodogpark.backend.repository.PetsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AgendamentoTutorService {
    private final AgendamentosRepository agendamentosRepository;
    private final CalendarioRepository calendarioRepository;
    private final PetsRepository petsRepository;

    public AgendamentoTutorService(AgendamentosRepository agendamentosRepository,
                                   CalendarioRepository calendarioRepository,
                                   UsuarioService usuarioService,
                                   PetsRepository petsRepository) {
        this.agendamentosRepository = agendamentosRepository;
        this.calendarioRepository = calendarioRepository;
        this.petsRepository = petsRepository;
    }

    public List<PetsDoTutorResponse> buscarPets(Long idUsuario) {
        List<PetsEntity> pets = petsRepository.findByFkUsuarioIdUsuario(idUsuario);
        List<PetsDoTutorResponse> petsDoTutor = new ArrayList<>();

        for (PetsEntity pet : pets) {
            PetsDoTutorResponse response = paraDtoPetTutor(pet);
            petsDoTutor.add(response);
        }

        return petsDoTutor;
    }


    private PetsDoTutorResponse paraDtoPetTutor(PetsEntity pet) {
        return new PetsDoTutorResponse(
                pet.getIdPet(),
                pet.getNome()
        );
    }
}
