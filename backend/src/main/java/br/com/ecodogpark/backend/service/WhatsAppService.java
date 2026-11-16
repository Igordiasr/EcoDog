package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WhatsAppService {
    private final ChatbotService chatbotService;
    private final AtendimentosPendentesService atendimentosPendentesService;
    private final EnviarMensagemService enviarMensagemService;
    private final WhatsAppConversaService whatsAppConversaService;

    public WhatsAppService(
            ChatbotService chatbotService,
            AtendimentosPendentesService atendimentosPendentesService,
            EnviarMensagemService enviarMensagemService,
            WhatsAppConversaService whatsAppConversaService
    ) {
        this.chatbotService = chatbotService;
        this.atendimentosPendentesService = atendimentosPendentesService;
        this.enviarMensagemService = enviarMensagemService;
        this.whatsAppConversaService = whatsAppConversaService;
    }

    public void processarMensagem(String rementente, String mensagem, String mensagemSid) {
        Optional<Long> idAtendimento =
                whatsAppConversaService.registrarMensagemRecebida(rementente, mensagem, mensagemSid);
        if (idAtendimento.isEmpty()) {
            System.out.println("Mensagem já processada");
            return;
        }
        String resposta = chatbotService.responder(rementente, mensagem);
        enviarMensagemService.enviar(rementente, resposta);
        whatsAppConversaService.registrarResposta(
                idAtendimento.get(),
                resposta,
                enviarMensagemService.mensagemSimulada()
        );
    }

    public List<AtendimentoPendenteRequest> listarAtendimentosPendentes() {
        return atendimentosPendentesService.listarAtendimentosPendentes();
    }
}
