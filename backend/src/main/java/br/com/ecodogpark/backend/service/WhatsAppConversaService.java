package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.entity.WhatsAppAtendimentoEntity;
import br.com.ecodogpark.backend.entity.WhatsAppMensagemEntity;
import br.com.ecodogpark.backend.enums.OrigemMensagem;
import br.com.ecodogpark.backend.enums.SituacaoAtendimento;
import br.com.ecodogpark.backend.exception.AtendimentoComEstadoDivergenteException;
import br.com.ecodogpark.backend.exception.AtendimentoNaoEncontradoException;
import br.com.ecodogpark.backend.repository.WhatsAppAtendimentoRepository;
import br.com.ecodogpark.backend.repository.WhatsAppMensagemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class WhatsAppConversaService {
    private final WhatsAppAtendimentoRepository whatsAppAtendimentoRepository;
    private final WhatsAppMensagemRepository whatsAppMensagemRepository;

    public WhatsAppConversaService(
            WhatsAppAtendimentoRepository whatsAppAtendimentoRepository,
            WhatsAppMensagemRepository whatsAppMensagemRepository
    ) {
        this.whatsAppAtendimentoRepository = whatsAppAtendimentoRepository;
        this.whatsAppMensagemRepository = whatsAppMensagemRepository;
    }

    @Transactional
    public Optional<Long> registrarMensagemRecebida(String remetente, String conteudo, String messageSid) {
        if (messageSid != null && !messageSid.isBlank() && whatsAppMensagemRepository.existsByMessageSid(messageSid)) {
            return Optional.empty();
        }

        List<SituacaoAtendimento> atendimentosAbertos = List.of(
                SituacaoAtendimento.AUTOMATICO,
                SituacaoAtendimento.EM_ATENDIMENTO,
                SituacaoAtendimento.PENDENTE
        );

        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository
                        .findFirstByNumeroTutorAndSituacaoInOrderByIniciadoEmDesc(
                                remetente,
                                atendimentosAbertos
                        )
                        .orElseGet(() ->
                                whatsAppAtendimentoRepository.save(new WhatsAppAtendimentoEntity(remetente))
                        );

        WhatsAppMensagemEntity mensagem = new WhatsAppMensagemEntity(
                atendimento,
                conteudo,
                OrigemMensagem.TUTOR,
                messageSid,
                false
        );

        whatsAppMensagemRepository.save(mensagem);
        return Optional.of(atendimento.getIdAtendimento());
    }

    @Transactional
    public void registrarResposta(
            Long idAtendimento,
            String conteudo,
            boolean simulada
    ) {
        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository
                        .findById(idAtendimento)
                        .orElseThrow(() ->
                                new AtendimentoNaoEncontradoException(
                                        "Atendimento nao encontrado: "
                                                + idAtendimento
                                ));

        WhatsAppMensagemEntity resposta = new WhatsAppMensagemEntity(
                atendimento,
                conteudo,
                OrigemMensagem.CHATBOT,
                null,
                simulada
        );

        whatsAppMensagemRepository.save(resposta);
    }

    public SituacaoAtendimento consultarSituacao(Long idAtendimento) {
        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository.findById(idAtendimento)
                        .orElseThrow(() ->
                                new AtendimentoNaoEncontradoException("Atendimento não encontrado: " + idAtendimento)
                        );
        return atendimento.getSituacao();
    }

    @Transactional
    public void solicitarAtendimentoHumando(Long idAtendimento) {
        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository.findById(idAtendimento)
                        .orElseThrow(() ->
                                new AtendimentoNaoEncontradoException("Atendimento não encontrado: " + idAtendimento)
                        );

        if (atendimento.getSituacao() != SituacaoAtendimento.AUTOMATICO) {
            throw new AtendimentoComEstadoDivergenteException("O atendimento não está no automático");
        }

        atendimento.setSituacao(SituacaoAtendimento.PENDENTE);
        whatsAppAtendimentoRepository.save(atendimento);
    }

    @Transactional
    public void assumirAtendimento(Long idAtendimento) {
        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository.findById(idAtendimento)
                        .orElseThrow(() ->
                                new AtendimentoNaoEncontradoException("Atendimento não encontrado: " + idAtendimento)
                        );
        if (atendimento.getSituacao() != SituacaoAtendimento.PENDENTE) {
            throw new AtendimentoComEstadoDivergenteException("Apenas atendimentos pendentes podem ser assumidos");
        }
        atendimento.setSituacao(SituacaoAtendimento.EM_ATENDIMENTO);
        whatsAppAtendimentoRepository.save(atendimento);
    }

    @Transactional
    public void finalizarAtendimento(Long idAtendimento) {
        WhatsAppAtendimentoEntity atendimento =
                whatsAppAtendimentoRepository.findById(idAtendimento)
                        .orElseThrow(() ->
                                new AtendimentoNaoEncontradoException("Atendimento não encontrado: " + idAtendimento)
                        );
        if (atendimento.getSituacao() != SituacaoAtendimento.EM_ATENDIMENTO) {
            throw new AtendimentoComEstadoDivergenteException("Apenas atendimentos em andamento podem ser encerrados");
        }
        atendimento.setSituacao(SituacaoAtendimento.FINALIZADO);
        atendimento.setEncerradoEm(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));
        whatsAppAtendimentoRepository.save(atendimento);
    }
}
