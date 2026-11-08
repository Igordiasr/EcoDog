package br.com.ecodogpark.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "whatsapp", name = "modo-envio", havingValue = "real")
public class MensagemTwilioService implements EnviarMensagemService {
    private final TwilioService twilioService;

    public MensagemTwilioService(TwilioService twilioService) {
        this.twilioService = twilioService;
    }

    @Override
    public void enviar(String destinatario, String mensagem) {
        twilioService.enviarMensagem(destinatario, mensagem);
    }
}
