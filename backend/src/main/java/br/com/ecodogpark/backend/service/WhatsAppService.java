package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WhatsAppService {
    private final ChatbotService chatbotService;
    private final AtendimentosPendentesService atendimentosPendentesService;
    private final EnviarMensagemService enviarMensagemService;

    public WhatsAppService(ChatbotService chatbotService, AtendimentosPendentesService atendimentosPendentesService, EnviarMensagemService enviarMensagemService) {
        this.chatbotService = chatbotService;
        this.atendimentosPendentesService = atendimentosPendentesService;
        this.enviarMensagemService = enviarMensagemService;
    }

    public void processarMensagem(String rementente, String mensagem) {
        String resposta = chatbotService.responder(rementente, mensagem);
        enviarMensagemService.enviar(rementente, resposta);
    }

    public List<AtendimentoPendenteRequest> listarAtendimentosPendentes() {
        return atendimentosPendentesService.listarAtendimentosPendentes();
    }
}
