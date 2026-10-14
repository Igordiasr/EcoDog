package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AtividadeDTO;
import br.com.ecodogpark.backend.dto.DiarioPetResponseDTO;
import br.com.ecodogpark.backend.dto.MedicacaoDTO;
import br.com.ecodogpark.backend.dto.ResumoDTO;
import br.com.ecodogpark.backend.entity.AtividadesDoDiaEntity;
import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import br.com.ecodogpark.backend.entity.ObservacaoDoDiaEntity;
import br.com.ecodogpark.backend.repository.AtividadeRepository;
import br.com.ecodogpark.backend.repository.MedicacaoRepository;
import br.com.ecodogpark.backend.repository.ObservacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class DiarioPetService {

    private static final String SITUACAO_CONCLUIDA = "CONCLUIDA";

    // Categorias de atividade que representam refeições/alimentação.
    private static final List<String> CATEGORIAS_REFEICAO = List.of("REFEICAO", "ALIMENTACAO", "RACAO");

    private final AtividadeRepository atividadeRepository;
    private final MedicacaoRepository medicacaoRepository;
    private final ObservacaoRepository observacaoRepository;

    public DiarioPetService(AtividadeRepository atividadeRepository,
                            MedicacaoRepository medicacaoRepository,
                            ObservacaoRepository observacaoRepository) {
        this.atividadeRepository = atividadeRepository;
        this.medicacaoRepository = medicacaoRepository;
        this.observacaoRepository = observacaoRepository;
    }

    @Transactional(readOnly = true)
    public DiarioPetResponseDTO obterDiarioDoPet(Long petId, LocalDate data) {

        // Consultas executadas sequencialmente dentro da mesma transação,
        // de modo a permitir o carregamento das associações LAZY usadas no mapeamento.
        List<AtividadesDoDiaEntity> atividades = atividadeRepository.buscarPorPetEData(petId, data);
        List<MedicacaoDoDiaEntity> medicacoes = medicacaoRepository.buscarPorPetEData(petId, data);
        List<ObservacaoDoDiaEntity> observacoes = observacaoRepository.buscarPorPetEData(petId, data);

        return new DiarioPetResponseDTO(
                petId,
                data,
                montarResumo(atividades),
                mapearAtividades(atividades),
                mapearMedicacoes(medicacoes),
                montarObservacoes(observacoes)
        );
    }

    private List<AtividadeDTO> mapearAtividades(List<AtividadesDoDiaEntity> atividades) {
        return atividades.stream()
                .map(atividade -> new AtividadeDTO(descricaoAtividade(atividade)))
                .toList();
    }

    private String descricaoAtividade(AtividadesDoDiaEntity atividade) {
        if (atividade.getFkAtividade() == null) {
            return "";
        }
        String descricao = atividade.getFkAtividade().getDescricao();
        return descricao != null ? descricao : atividade.getFkAtividade().getNome();
    }

    private List<MedicacaoDTO> mapearMedicacoes(List<MedicacaoDoDiaEntity> medicacoes) {
        return medicacoes.stream()
                .map(medicacao -> new MedicacaoDTO(
                        nomeMedicacao(medicacao),
                        SITUACAO_CONCLUIDA.equalsIgnoreCase(medicacao.getSituacao())))
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

    private ResumoDTO montarResumo(List<AtividadesDoDiaEntity> atividades) {
        return new ResumoDTO(fraseRefeicao(atividades), fraseEngajamento(atividades));
    }

    private String fraseEngajamento(List<AtividadesDoDiaEntity> atividades) {
        if (atividades.isEmpty()) {
            return "Não foram registadas atividades para este dia.";
        }
        long concluidas = atividades.stream().filter(this::concluida).count();
        int total = atividades.size();

        if (concluidas == total) {
            return "O pet participou em todas as atividades do dia.";
        }
        if (concluidas == 0) {
            return "O pet não participou nas atividades do dia.";
        }
        return "O pet participou em " + concluidas + " de " + total + " atividades do dia.";
    }

    private String fraseRefeicao(List<AtividadesDoDiaEntity> atividades) {
        List<AtividadesDoDiaEntity> refeicoes = atividades.stream()
                .filter(this::ehRefeicao)
                .toList();

        if (refeicoes.isEmpty()) {
            return "Não foram registadas refeições para este dia.";
        }
        long concluidas = refeicoes.stream().filter(this::concluida).count();
        int total = refeicoes.size();

        if (concluidas == total) {
            return "Todas as refeições do dia foram concluídas.";
        }
        if (concluidas == 0) {
            return "Nenhuma refeição do dia foi concluída.";
        }
        return concluidas + " de " + total + " refeições do dia foram concluídas.";
    }

    private boolean concluida(AtividadesDoDiaEntity atividade) {
        return SITUACAO_CONCLUIDA.equalsIgnoreCase(atividade.getSituacao());
    }

    private boolean ehRefeicao(AtividadesDoDiaEntity atividade) {
        if (atividade.getFkAtividade() == null || atividade.getFkAtividade().getCategoria() == null) {
            return false;
        }
        String categoria = atividade.getFkAtividade().getCategoria().toUpperCase(Locale.ROOT);
        return CATEGORIAS_REFEICAO.stream().anyMatch(categoria::contains);
    }
}
