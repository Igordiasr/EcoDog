package br.com.ecodogpark.backend.service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-number}")
    private String whatsappNumber;

    @Value("${twilio.content-sid}")
    private String contentSid;

    public void enviarMensagem(String remetente, String mensagem) {
        Twilio.init(accountSid, authToken);

        try {
            String resposta = """
                        Olá!
                        🐶 Bem-vindo à EcoDog Park!
                        Como posso ajudar?
                """;
            Message message = Message.creator(
                            new PhoneNumber(remetente),
                            new PhoneNumber(whatsappNumber),
                            resposta
                    ).setContentSid(contentSid)
                    .create();
        } catch (ApiException e) {
            System.out.println("========== ERRO TWILIO ==========");
            System.out.println("Mensagem: " + e.getMessage());
            System.out.println("Código Twilio: " + e.getCode());
            System.out.println("Status HTTP: " + e.getStatusCode());
            System.out.println("Mais informações: " + e.getMoreInfo());
            System.out.println("=================================");
            throw e;
        }

    }
}