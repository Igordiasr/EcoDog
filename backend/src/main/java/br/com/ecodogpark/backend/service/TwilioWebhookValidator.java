package br.com.ecodogpark.backend.service;

import com.twilio.security.RequestValidator;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class TwilioWebhookValidator {
    private final String authToken;
    private final String webhookUrl;

    public TwilioWebhookValidator(
            @Value("${twilio.auth-token}")
            String authToken,
            @Value("${twilio.webhook-url}")
            String webhookUrl
    ) {
        this.authToken = authToken;
        this.webhookUrl = webhookUrl;
    }

    public boolean validar(HttpServletRequest request, String assinatura) {
        if (assinatura == null || assinatura.isBlank()) {
            return false;
        }

        Map<String, String> parametros = new HashMap<>();

        request.getParameterMap().forEach((nome, valores) -> {
            if (valores != null && valores.length > 0) {
                parametros.put(nome, valores[0]);
            }
        });

        RequestValidator validator = new RequestValidator(authToken);
        return validator.validate(webhookUrl, parametros, assinatura);
    }
}
