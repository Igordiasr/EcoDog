package br.com.ecodogpark.backend.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "whatsapp", name = "modo-envio", havingValue = "simulado", matchIfMissing = true)
public class MensagemSimuladaService implements EnviarMensagemService {
    @Override
    public void enviar(String destinatario, String mensagem) {
        System.out.println("===== WHATSAPP SIMULADO =====");
        System.out.println("Destinatário: " + destinatario);
        System.out.println("Mensagem: " + mensagem);
        System.out.println("=============================");
    }
}
