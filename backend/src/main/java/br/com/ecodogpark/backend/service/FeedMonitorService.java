package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.entity.id.AtividadeDoDiaId;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.MedicacaoDoDiaRepository;
import br.com.ecodogpark.backend.repository.ObservacaoDoDiaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class FeedMonitorService {
    private final AgendamentoRepository agendamentoRepository;
    private final AtividadeDoDiaRepository atividadeDoDiaRepository;
    private final MedicacaoDoDiaRepository medicacaoDoDiaRepository;
    private final ObservacaoDoDiaRepository observacaoDoDiaRepository;
    private final PetService petService;


    public FeedMonitorService(AgendamentoRepository agendamentoRepository,
                              AtividadeDoDiaRepository atividadeDoDiaRepository,
                              MedicacaoDoDiaRepository medicacaoDoDiaRepository,
                              ObservacaoDoDiaRepository observacaoDoDiaRepository,
                              PetService petService) {
        this.agendamentoRepository = agendamentoRepository;
        this.atividadeDoDiaRepository = atividadeDoDiaRepository;
        this.medicacaoDoDiaRepository = medicacaoDoDiaRepository;
        this.observacaoDoDiaRepository = observacaoDoDiaRepository;
        this.petService = petService;
    }

    public PetResponse buscarPetParaMonitor(Long id) {
        return petService.buscarPorId(id);
    }

    public List<AtividadeDoDiaResponse> buscarAtividades(Long id) {
        List<AtividadeDoDiaEntity> atividades =
                atividadeDoDiaRepository.findByAgendamentoContratoPetIdPetAndAgendamentoCalendarioData(id, LocalDate.now());
        List<AtividadeDoDiaResponse> atividadeDoDiaResponses = new ArrayList<>();

        for (AtividadeDoDiaEntity atividade : atividades) {
           AtividadeDoDiaResponse response = paraDtoAtividade(atividade);
           atividadeDoDiaResponses.add(response);
        }

        return atividadeDoDiaResponses;
    }

    public List<MedicacaoDoDiaResponse> buscarMedicacao(Long id) {
        List<MedicacaoDoDiaEntity> medicacoes =
                medicacaoDoDiaRepository.findByAgendamentoContratoPetIdPetAndAgendamentoCalendarioData(id, LocalDate.now());
        List<MedicacaoDoDiaResponse> medicacaoDoDiaResponses = new ArrayList<>();

        for (MedicacaoDoDiaEntity medicacao : medicacoes) {
            MedicacaoDoDiaResponse response = paraDtoMedicacao(medicacao);
            medicacaoDoDiaResponses.add(response);
        }

        return medicacaoDoDiaResponses;
    }

    public ObservacaoDoDiaResponse criarObservacao(Long id, ObservacaoDoDiaRequest request) {
        ObservacaoDoDiaEntity observacaoDoDia = new ObservacaoDoDiaEntity();
        preencherObservacao(id, observacaoDoDia, request);

        return paraDtoObservacao(observacaoDoDiaRepository.save(observacaoDoDia));
    }

    public AtividadeDoDiaResponse atualizarAtividade(AtividadeDoDiaId id, AtividadeDoDiaRequest request) {
        AtividadeDoDiaEntity atividade = obterAtividade(id);
        preencherAtividade(atividade, request);

        return paraDtoAtividade(atividadeDoDiaRepository.save(atividade));
    }

    public MedicacaoDoDiaResponse atualizarMedicacao(Long id, MedicacaoDoDiaRequest request) {
        MedicacaoDoDiaEntity medicacao = obterMedicacao(id);
        preencherMedicacao(medicacao, request);

        return paraDtoMedicacao(medicacaoDoDiaRepository.save(medicacao));

    }


    private void preencherObservacao(Long id, ObservacaoDoDiaEntity observacao, ObservacaoDoDiaRequest request) {
        observacao.setAgendamento(agendamentoRepository.findByContratoPetIdPetAndCalendarioData(id, LocalDate.now()));
        observacao.setDescricao(request.observacao());
        observacao.setHorario(LocalTime.now());
    }

    private void preencherAtividade(AtividadeDoDiaEntity atividade, AtividadeDoDiaRequest request) {
        atividade.setStatus(request.status());
        atividade.setObservacoes(request.observacao());
    }

    private void preencherMedicacao(MedicacaoDoDiaEntity medicacao, MedicacaoDoDiaRequest request) {
        medicacao.setStatus(request.status());
        medicacao.setObservacao(request.observacao());
    }

    private ObservacaoDoDiaResponse paraDtoObservacao(ObservacaoDoDiaEntity observacao) {
        return new ObservacaoDoDiaResponse(observacao.getDescricao());
    }

    private AtividadeDoDiaResponse paraDtoAtividade(AtividadeDoDiaEntity atividade) {
        return new AtividadeDoDiaResponse(
                atividade.getAtividade().getNome(),
                atividade.getStatus(),
                atividade.getObservacoes()
        );
    }

    private MedicacaoDoDiaResponse paraDtoMedicacao(MedicacaoDoDiaEntity medicacao) {
        return new MedicacaoDoDiaResponse(
                medicacao.getMedicacao().getNome(),
                medicacao.getStatus(),
                medicacao.getObservacao()
        );
    }

    private AtividadeDoDiaEntity obterAtividade(AtividadeDoDiaId id) {
        return atividadeDoDiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada"));
    }

    private MedicacaoDoDiaEntity obterMedicacao(Long id) {
        return medicacaoDoDiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicação não encontrada"));
    }
}
