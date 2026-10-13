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
import java.time.ZoneId;
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

        buscarAgendamentoDoPet(id);

        return new PetFeedMonitorResponse(
                pet.nome(),
                pet.raca(),
                tutor.nome(),
                pet.cuidadosEspeciais()
        );
    }

    public List<AtividadeDoPetResponse> buscarAtividades(Long id) {
        List<AtividadeDoPetResponse> atividadeDoPetResponses = new ArrayList<>();
        List<ParticipacaoDoPetEntity> atividades =
                participacaoDoPetRepository.buscarAtividadeDoPetAgendadoEConfirmado(id, LocalDate.now(ZoneId.of("America/Sao_Paulo")), SituacaoAgendamento.CONFIRMADO);

        for (ParticipacaoDoPetEntity atividade : atividades) {
           AtividadeDoPetResponse response = paraDtoAtividade(atividade);
           atividadeDoPetResponses.add(response);
        }

        return atividadeDoPetResponses;
    }

    public List<MedicacaoDoDiaResponse> buscarMedicacao(Long id) {
        List<MedicacaoDoDiaResponse> medicacaoDoDiaResponses = new ArrayList<>();
        List<MedicacaoDoDiaEntity> medicacoes =
                medicacaoDoDiaRepository.buscarMedicacaoDoDiaAgendadoEConfirmado(id, LocalDate.now(ZoneId.of("America/Sao_Paulo")), SituacaoAgendamento.CONFIRMADO);

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
        AgendamentosEntity agendamentoEncontrado = buscarAgendamentoDoPet(id);

        observacao.setAgendamento(agendamentoEncontrado);
        observacao.setDescricao(request.observacao());
        observacao.setHorario(LocalTime.now());
    }

    private void preencherAtividade(ParticipacaoDoPetEntity atividade, AtividadeDoPetRequest request) {
        validarRequestAtividade(request);

        atividade.setSituacao(request.situacao());
        if (request.situacao() == SituacaoAtividade.PARTICIPOU) {
            atividade.setObservacao("Sem observação");
            return;
        }
        atividade.setObservacao(request.observacao());
    }

    private void preencherMedicacao(MedicacaoDoDiaEntity medicacao, MedicacaoDoDiaRequest request) {
        validarRequestMedicacao(request);

        medicacao.setSituacao(request.situacao());
        if (request.situacao() == SituacaoMedicacao.TOMOU) {
            medicacao.setObservacao("Sem observação");
            return;
        }
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

        private AgendamentosEntity buscarAgendamentoDoPet(Long id) {
            return agendamentoRepository.findByFkPetIdPetAndFkCalendarioDataAndSituacao(id, LocalDate.now(ZoneId.of("America/Sao_Paulo")), SituacaoAgendamento.CONFIRMADO)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado ou não confirmado"));
        }

    private ParticipacaoDoPetEntity obterAtividade(Long idParticipacao, Long idPet) {
        return participacaoDoPetRepository.buscarAtividadeDoPetNoAgendamento(idParticipacao, idPet, LocalDate.now(ZoneId.of("America/Sao_Paulo")), SituacaoAgendamento.CONFIRMADO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada"));
    }

    private MedicacaoDoDiaEntity obterMedicacao(Long idMedicacaoDoDia, Long idPet) {
        return medicacaoDoDiaRepository.buscarMedicacaoDoPetNoAgendamento(idMedicacaoDoDia, idPet, LocalDate.now(ZoneId.of("America/Sao_Paulo")), SituacaoAgendamento.CONFIRMADO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicação não encontrada"));
    }


    private void validarRequestAtividade(AtividadeDoPetRequest request) {
        if (request.situacao() == null || request.situacao() == SituacaoAtividade.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma opção válida");
        }

        if (request.situacao() == (SituacaoAtividade.NAO_PARTICIPOU) &&
                (request.observacao() == null || request.observacao().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A observação é obrigatória quando o pet não participa");
        }
    }

    private void validarRequestMedicacao(MedicacaoDoDiaRequest request) {
        if (request.situacao() == null || request.situacao() == SituacaoMedicacao.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha uma opção válida");
        }

        if (request.situacao() == SituacaoMedicacao.NAO_TOMOU &&
                (request.observacao() == null || request.observacao().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A observação é obrigatória quando não é aplicado a medicação");
        }
    }
}