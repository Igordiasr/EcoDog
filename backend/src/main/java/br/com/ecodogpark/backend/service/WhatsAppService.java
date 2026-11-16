package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppAtendimentoResponse;
import br.com.ecodogpark.backend.enums.SituacaoAtendimento;
import br.com.ecodogpark.backend.mapper.WhatsAppAtendimentoMapper;
import br.com.ecodogpark.backend.repository.WhatsAppAtendimentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WhatsAppService {
    private final ChatbotService chatbotService;
    private final AtendimentosPendentesService atendimentosPendentesService;
    private final EnviarMensagemService enviarMensagemService;
    private final WhatsAppConversaService whatsAppConversaService;
    private final WhatsAppAtendimentoRepository whatsAppAtendimentoRepository;

    public WhatsAppService(
            ChatbotService chatbotService,
            AtendimentosPendentesService atendimentosPendentesService,
            EnviarMensagemService enviarMensagemService,
            WhatsAppConversaService whatsAppConversaService,
            WhatsAppAtendimentoRepository whatsAppAtendimentoRepository) {
        this.chatbotService = chatbotService;
        this.atendimentosPendentesService = atendimentosPendentesService;
        this.enviarMensagemService = enviarMensagemService;
        this.whatsAppConversaService = whatsAppConversaService;
        this.whatsAppAtendimentoRepository = whatsAppAtendimentoRepository;
    }

    public void processarMensagem(String rementente, String mensagem, String mensagemSid) {
        Optional<Long> idAtendimento =
                whatsAppConversaService.registrarMensagemRecebida(rementente, mensagem, mensagemSid);
        if (idAtendimento.isEmpty()) {
            System.out.println("Mensagem já processada");
            return;
        }
        Long id = idAtendimento.get();
        SituacaoAtendimento situacao = whatsAppConversaService.consultarSituacao(id);

        if (situacao.equals(SituacaoAtendimento.PENDENTE) || situacao.equals(SituacaoAtendimento.EM_ATENDIMENTO)) {
            System.out.println("A solicitação está pendente ou em atendimento");
            return;
        }

        String resposta = chatbotService.responder(rementente, mensagem, id);
        enviarMensagemService.enviar(rementente, resposta);
        whatsAppConversaService.registrarResposta(
                idAtendimento.get(),
                resposta,
                enviarMensagemService.mensagemSimulada()
        );
    }

    public List<WhatsAppAtendimentoResponse> listarAtendimentosPendentes() {
        return WhatsAppAtendimentoMapper
                .paraWhatsAppResponse(
                        whatsAppAtendimentoRepository.
                                findBySituacaoOrderByIniciadoEmAsc(
                                        SituacaoAtendimento.PENDENTE
                                ));
    }

    public void assumirAtendimento(Long idAtendimento) {
        whatsAppConversaService.assumirAtendimento(idAtendimento);
    }

    public void finalizarAtendimento(Long idAtendimento) {
        whatsAppConversaService.finalizarAtendimento(idAtendimento);
    }
}
