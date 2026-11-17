package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.DiarioPetTutor.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.CategoriaAtividade;
import br.com.ecodogpark.backend.exception.CampoInvalidoException;
import br.com.ecodogpark.backend.exception.PetNaoEncontradoException;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiarioPetService {

    private final MedicacoesDoPetRepository medicacoesDoPetRepository;
    private final ObservacaoRepository observacaoRepository;
    private final ParticipacaoDoPetRepository participacaoDoPetRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final PetRepository petRepository;

    public DiarioPetService(
            MedicacoesDoPetRepository medicacoesDoPetRepository,
            ObservacaoRepository observacaoRepository,
            ParticipacaoDoPetRepository participacaoDoPetRepository,
            AgendamentoRepository agendamentoRepository, PetRepository petRepository) {
        this.medicacoesDoPetRepository = medicacoesDoPetRepository;
        this.observacaoRepository = observacaoRepository;
        this.participacaoDoPetRepository = participacaoDoPetRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.petRepository = petRepository;
    }

    public List<DataAgendadaResponse> obterAgendamentosAnteriores(@RequestParam UUID idPet) {
        if (!petRepository.existsById(idPet)) {
            throw new PetNaoEncontradoException("Pet não encontrado");
        }
        return agendamentoRepository.buscarDatasDeAgendamentosAnteriores(idPet);
    }

    @Transactional(readOnly = true)
    public DiarioPetResponse obterDiarioDoPet(UUID idPet, LocalDate dataReferencia) {
        if (Objects.isNull(idPet)) {
            throw new CampoInvalidoException("idPet não pode ser nulo.");
        }
        if (Objects.isNull(dataReferencia)) {
            dataReferencia = agendamentoRepository.buscarUltimoAgendamento(idPet);
        }
        if (dataReferencia.isAfter(LocalDate.now())) {
            throw new CampoInvalidoException("A data informada deve ser anterior a data atual.");
        }
        if (!petRepository.existsById(idPet)) {
            throw new PetNaoEncontradoException("Pet não encontrado");
        }

        List<ParticipacaoDoPetEntity> atividades = participacaoDoPetRepository.buscarPorPetEData(idPet, dataReferencia);
        System.out.println("atividades: " + atividades);
        List<MedicacaoDoDiaEntity> medicacoes = medicacoesDoPetRepository.buscarPorPetEData(idPet, dataReferencia);
        List<ObservacaoDoDiaEntity> observacoes = observacaoRepository.buscarPorPetEData(idPet, dataReferencia);

        return new DiarioPetResponse(
                idPet,
                dataReferencia,
                montarResumo(atividades),
                mapearAtividades(atividades),
                mapearMedicacoes(medicacoes),
                montarObservacoes(observacoes)
        );
    }

    private List<AtividadeDiarioPetResponse> mapearAtividades(List<ParticipacaoDoPetEntity> atividades) {
        return atividades.stream()
                .map(atividade -> {
                    if (atividade.equals(SituacaoAtividade.PENDENTE)) {
                        return null;
                    }
                    return new AtividadeDiarioPetResponse(
                            atividade.getFkAtividadesDoDia().getFkAtividade().getNome(),
                            atividade.getFkAtividadesDoDia().getFkAtividade().getDescricao(),
                            atividade.getSituacao(),
                            atividade.getObservacao(),
                            atividade.getFkAtividadesDoDia().getSituacao()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    private List<MedicacaoDiarioPetResponse> mapearMedicacoes(List<MedicacaoDoDiaEntity> medicacoes) {
        return medicacoes.stream()
                .map(medicacao -> new MedicacaoDiarioPetResponse(
                        nomeMedicacao(medicacao),
                        medicacao.getSituacao()))
                .toList();
    }

    private String nomeMedicacao(MedicacaoDoDiaEntity medicacao) {
        if (medicacao.getFkMedicacaoDoPet() == null || medicacao.getFkMedicacaoDoPet().getFkMedicacao() == null) {
            return "";
        }
        return medicacao.getFkMedicacaoDoPet().getFkMedicacao().getNome();
    }

    private String montarObservacoes(List<ObservacaoDoDiaEntity> observacoes) {
        return observacoes.stream()
                .map(ObservacaoDoDiaEntity::getDescricao)
                .filter(Objects::nonNull)
                .filter(texto -> !texto.isBlank())
                .collect(Collectors.joining("\n"));
    }

    private ResumoDiarioPetResponse montarResumo(List<ParticipacaoDoPetEntity> atividades) {
        return new ResumoDiarioPetResponse(fraseRefeicao(atividades), fraseEngajamento(atividades));
    }

    private String fraseEngajamento(List<ParticipacaoDoPetEntity> atividades) {
        if (atividades.isEmpty()) {
            return "Não foram registadas atividades para este dia.";
        }
        long concluidas = atividades.stream().filter(this::atividadeEstaConcluida).count();
        int total = atividades.size();

        if (concluidas == total) {
            return "O pet participou em todas as atividades do dia.";
        }
        if (concluidas == 0) {
            return "O pet não participou nas atividades do dia.";
        }
        return "O pet participou em " + concluidas + " de " + total + " atividades do dia.";
    }

    private String fraseRefeicao(List<ParticipacaoDoPetEntity> atividades) {
        List<ParticipacaoDoPetEntity> refeicoes = atividades.stream()
                .filter(this::ehRefeicao)
                .toList();

        if (refeicoes.isEmpty()) {
            return "Não foram registadas refeições para este dia.";
        }
        long concluidas = refeicoes.stream().filter(this::atividadeEstaConcluida).count();
        int total = refeicoes.size();

        if (concluidas == total) {
            return "Todas as refeições do dia foram concluídas.";
        }
        if (concluidas == 0) {
            return "Nenhuma refeição do dia foi concluída.";
        }
        return concluidas + " de " + total + " refeições do dia foram concluídas.";
    }

    private boolean atividadeEstaConcluida(ParticipacaoDoPetEntity atividade) {
        return atividade.getSituacao().equals(SituacaoAtividade.PARTICIPOU) || atividade.getSituacao().equals(SituacaoAtividade.NAO_PARTICIPOU);
    }

    private boolean ehRefeicao(ParticipacaoDoPetEntity atividade) {
        if (atividade.getFkAtividadesDoDia().getFkAtividade() == null || atividade.getFkAtividadesDoDia().getFkAtividade().getCategoria() == null) {
            return false;
        }
        return CategoriaAtividade.isRefeicao(atividade.getFkAtividadesDoDia().getFkAtividade().getCategoria());
    }
}
