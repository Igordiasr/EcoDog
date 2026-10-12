package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.dto.FeedMonitorDTO.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FeedMonitorService {
    private final AgendamentoRepository agendamentoRepository;
    private final MedicacaoDoDiaRepository medicacaoDoDiaRepository;
    private final ObservacaoDoDiaRepository observacaoDoDiaRepository;
    private final ParticipacaoDoPetRepository participacaoDoPetRepository;

    private final PetService petService;
    private final UsuarioService usuarioService;

    public FeedMonitorService(AgendamentoRepository agendamentoRepository,
                              MedicacaoDoDiaRepository medicacaoDoDiaRepository,
                              ObservacaoDoDiaRepository observacaoDoDiaRepository,
                              ParticipacaoDoPetRepository participacaoDoPetRepository,
                              PetService petService, UsuarioService usuarioService) {
        this.agendamentoRepository = agendamentoRepository;
        this.medicacaoDoDiaRepository = medicacaoDoDiaRepository;
        this.observacaoDoDiaRepository = observacaoDoDiaRepository;
        this.participacaoDoPetRepository = participacaoDoPetRepository;
        this.petService = petService;
        this.usuarioService = usuarioService;
    }

    public PetFeedMonitorResponse buscarPetParaMonitor(Long id) {
        PetResponse pet = petService.buscarPorId(id);
        UsuarioResponse tutor = usuarioService.buscarTutorPorId(pet.tutorId());

        return new PetFeedMonitorResponse(
                pet.nome(),
                pet.raca(),
                tutor.nome(),
                pet.cuidadosEspeciais()
        );
    }

    public List<AtividadeDoPetResponse> buscarAtividades(Long id) {
        List<ParticipacaoDoPetEntity> atividades =
                participacaoDoPetRepository.findByFkAgendamentoFkPetIdPetAndFkAgendamentoFkCalendarioData(id, LocalDate.now());
        List<AtividadeDoPetResponse> atividadeDoPetResponses = new ArrayList<>();

        for (ParticipacaoDoPetEntity atividade : atividades) {
           AtividadeDoPetResponse response = paraDtoAtividade(atividade);
           atividadeDoPetResponses.add(response);
        }

        return atividadeDoPetResponses;
    }

    public List<MedicacaoDoDiaResponse> buscarMedicacao(Long id) {
        List<MedicacaoDoDiaEntity> medicacoes =
                medicacaoDoDiaRepository.findByFkAgendamentoFkPetIdPetAndFkAgendamentoFkCalendarioData(id, LocalDate.now());
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

    public AtividadeDoPetResponse atualizarAtividade(Long idParticipacao, Long idPet, AtividadeDoPetRequest request) {
        ParticipacaoDoPetEntity atividade = obterAtividade(idParticipacao, idPet);
        preencherAtividade(atividade, request);

        return paraDtoAtividade(participacaoDoPetRepository.save(atividade));
    }

    public MedicacaoDoDiaResponse atualizarMedicacao(Long idMedicacao, Long idPet, MedicacaoDoDiaRequest request) {
        MedicacaoDoDiaEntity medicacao = obterMedicacao(idMedicacao, idPet);
        preencherMedicacao(medicacao, request);

        return paraDtoMedicacao(medicacaoDoDiaRepository.save(medicacao));
    }


    private void preencherObservacao(Long id, ObservacaoDoDiaEntity observacao, ObservacaoDoDiaRequest request) {
        AgendamentosEntity agendamentoEncontrado =
                agendamentoRepository.findByFkPetIdPetAndFkCalendarioData(id, LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));

        observacao.setAgendamento(agendamentoEncontrado);
        observacao.setDescricao(request.observacao());
        observacao.setHorario(LocalTime.now());
    }

    private void preencherAtividade(ParticipacaoDoPetEntity atividade, AtividadeDoPetRequest request) {
        validarRequestAtividade(request);

        atividade.setSituacao(request.situacao());
        atividade.setObservacao(request.observacao());
    }

    private void preencherMedicacao(MedicacaoDoDiaEntity medicacao, MedicacaoDoDiaRequest request) {
        validarRequestMedicacao(request);

        medicacao.setSituacao(request.situacao());
        medicacao.setObservacao(request.observacao());
    }

    private ObservacaoDoDiaResponse paraDtoObservacao(ObservacaoDoDiaEntity observacao) {
        return new ObservacaoDoDiaResponse(observacao.getDescricao());
    }

    private AtividadeDoPetResponse paraDtoAtividade(ParticipacaoDoPetEntity atividade) {
        return new AtividadeDoPetResponse(
                atividade.getIdParticipacaoDoPet(),
                atividade.getFkAtividadesDoDia().getFkAtividade().getNome(),
                atividade.getFkAtividadesDoDia().getFkAtividade().getCategoria(),
                atividade.getSituacao(),
                atividade.getObservacao()
        );
    }

    private MedicacaoDoDiaResponse paraDtoMedicacao(MedicacaoDoDiaEntity medicacao) {
        return new MedicacaoDoDiaResponse(
                medicacao.getIdMedicacaoDoDia(),
                medicacao.getFkMedicacaoDoPet().getFkMedicacao().getNome(),
                medicacao.getSituacao(),
                medicacao.getObservacao()
        );
    }

    private ParticipacaoDoPetEntity obterAtividade(Long idParticipacao, Long idPet) {
        return participacaoDoPetRepository.findByIdParticipacaoDoPetAndFkAgendamentoFkPetIdPet(idParticipacao, idPet)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada"));
    }

    private MedicacaoDoDiaEntity obterMedicacao(Long idMedicacao, Long idPet) {
        return medicacaoDoDiaRepository.findByIdMedicacaoDoDiaAndFkAgendamentoFkPetIdPet(idMedicacao, idPet)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicação não encontrada"));
    }

    private void validarRequestAtividade(AtividadeDoPetRequest request) {
        if (request.situacao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A situação da atividade do pet não pode ser nula ");
        }

        if (request.situacao() == (SituacaoAtividade.NAO_PARTICIPOU) &&
                (request.observacao() == null || request.observacao().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A observação é obrigatória quando o pet não participa");
        }
    }

    private void validarRequestMedicacao(MedicacaoDoDiaRequest request) {
        if (request.situacao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A situação da medicação do pet não pode ser nula");
        }

        if (request.situacao() == SituacaoMedicacao.NAO_APLICADO &&
                (request.observacao() == null || request.observacao().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A observação é obrigatória quando não é aplicado a medicação");
        }
    }
}
