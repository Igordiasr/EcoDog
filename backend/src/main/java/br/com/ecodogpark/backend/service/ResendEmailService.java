package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.exception.ChaveDeApiNaoEncontradaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class ResendEmailService {
    private final RestClient restClient;
    private final String apiKey;
    private final String remetente;
    private final String urlFrontend;

    public ResendEmailService(
            RestClient.Builder restClientBuilder,
            @Value("${resend.api-key}")
            String apiKey,
            @Value("${resend.from}")
            String remetente,
            @Value("${app.frontend.reset-password-url}")
            String urlFrontend) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.resend.com")
                .build();
        this.apiKey = apiKey;
        this.remetente = remetente;
        this.urlFrontend = urlFrontend;
    }

    public void enviarLinkRedefinicaoSenha(String email, String token) {
        if (apiKey.isBlank()) {
            throw new ChaveDeApiNaoEncontradaException("A variável responsável pela chave de API não está configurada");
        }

        String link = UriComponentsBuilder
                .fromUriString(urlFrontend)
                .queryParam("token", token)
                .build()
                .toUriString();

        String html = """
        <!DOCTYPE html>
        <html lang="pt-BR">
        <body style="margin:0;padding:0;background-color:#f3f7f3;font-family:Arial,sans-serif;color:#26332b;">
          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0"
                 style="background-color:#f3f7f3;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0"
                       style="max-width:560px;background:#ffffff;border-radius:12px;">
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 20px;color:#27824a;font-size:14px;font-weight:bold;">
                        ECODOG
                      </p>

                      <h1 style="margin:0 0 16px;font-size:24px;">
                        Redefinição de senha
                      </h1>

                      <p style="font-size:16px;line-height:1.6;">
                        Recebemos uma solicitação para redefinir a senha da sua conta.
                      </p>

                      <p style="margin:28px 0;">
                        <a href="{{LINK}}"
                           style="display:inline-block;padding:14px 22px;background:#27824a;
                                  color:#ffffff;text-decoration:none;border-radius:8px;
                                  font-weight:bold;">
                          Criar nova senha
                        </a>
                      </p>

                      <p style="font-size:14px;line-height:1.6;">
                        O link expira em <strong>15 minutos</strong>. Se você não pediu
                        essa alteração, pode ignorar este e-mail.
                      </p>

                      <p style="font-size:13px;line-height:1.6;color:#5b665e;">
                        Se o botão não funcionar, copie este endereço e cole no navegador:<br>
                        <a href="{{LINK}}" style="color:#27824a;word-break:break-all;">
                          {{LINK}}
                        </a>
                      </p>

                      <hr style="margin:28px 0;border:0;border-top:1px solid #e5e9e5;">

                      <p style="margin:0;font-size:12px;color:#7a837c;">
                        Mensagem automática. Por favor, não responda.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """.replace("{{LINK}}", link);

        Map<String, Object> corpo = Map.of(
                "from", remetente,
                "to", List.of(email),
                "subject", "Redefinição de senha - EcoDog",
                "text", """
                            Recebemos uma solicitação para redefinir a senha da sua conta EcoDog.
                    
                            Acesse este link para criar uma nova senha:
                            %s
                    
                            O link expira em 15 minutos. Se você não fez essa solicitação, ignore este e-mail.
                            """.formatted(link),
                "html", html
        );

        restClient.post()
                .uri("/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(corpo)
                .retrieve()
                .toBodilessEntity();

    }
}
