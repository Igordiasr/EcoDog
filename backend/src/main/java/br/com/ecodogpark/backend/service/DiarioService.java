package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.Entity.AtividadeDoDiaEntity;
import br.com.ecodogpark.backend.Entity.AtividadeEntity;
import br.com.ecodogpark.backend.dto.DiarioPetRequest;
import br.com.ecodogpark.backend.dto.DiarioPetResponse;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.AtividadeRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DiarioService {
    private final PetService petService;
    private final AtividadeRepository atividadeRepository;
    private final AtividadeDoDiaRepository atividadeDoDiaRepository;

    public DiarioService(PetService petService,
                         AtividadeRepository atividadeRepository,
                         AtividadeDoDiaRepository atividadeDoDiaRepository) {
        this.petService = petService;
        this.atividadeRepository = atividadeRepository;
        this.atividadeDoDiaRepository = atividadeDoDiaRepository;
    }

    public DiarioPetResponse registrarAtividade(DiarioPetRequest dto) {
        AtividadeEntity atividade = atividadeRepository.findById(dto.idAtividades())
                .orElseGet(AtividadeEntity::new);
        atividade.setNome(dto.nome().trim());
        atividade.setDuracao(dto.duracao());
        return paraDto(atividadeRepository.save(atividade));
    }

    public List<DiarioPetResponse> buscarAtividadePorPet(Long idPet) {
        petService.buscarPorId(idPet);
        return atividadeDoDiaRepository.findByAgendamentoContratoPetIdPet(idPet).stream()
                .map(this::paraDiarioDto)
                .toList();
    }

    private DiarioPetResponse paraDto(AtividadeEntity e) {
        return new DiarioPetResponse(e.getIdAtividades(), e.getNome(), e.getDuracao(), null);
    }

    private DiarioPetResponse paraDiarioDto(AtividadeDoDiaEntity e) {
        Integer idAtividades = e.getAtividade() != null ? e.getAtividade().getIdAtividades() : null;
        String nome = e.getAtividade() != null ? e.getAtividade().getNome() : null;
        Long duracao = e.getAtividade() != null ? e.getAtividade().getDuracao() : null;
        return new DiarioPetResponse(idAtividades, nome, duracao, e.getStatus());
    }
}