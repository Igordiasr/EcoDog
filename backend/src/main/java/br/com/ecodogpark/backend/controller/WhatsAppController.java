package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import br.com.ecodogpark.backend.service.AtendimentosPendentesService;
import br.com.ecodogpark.backend.service.ChatbotService;
import br.com.ecodogpark.backend.service.TwilioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {
    private final TwilioService twilioService;
    private final ChatbotService chatbotService;
    private final AtendimentosPendentesService atendimentosPendentesService;

    public WhatsAppController(TwilioService twilioService, ChatbotService chatbotService, AtendimentosPendentesService atendimentosPendentesService) {
        this.twilioService = twilioService;
        this.chatbotService = chatbotService;
        this.atendimentosPendentesService = atendimentosPendentesService;
    }

    @PostMapping("/enviar")
    public String enviarMensagem(
            @RequestParam String numero,
            @RequestParam String mensagem
    ) {
        twilioService.enviarMensagem(numero, mensagem);
        return "Mensagem enviada";
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> receberMensagem(
            @RequestParam("From") String remetente,
            @RequestParam("Body") String mensagem
    ) {
        System.out.println("================================");
        System.out.println("Mensagem recebida!");
        System.out.println("Remetente: " + remetente);
        System.out.println("Mensagem: " + mensagem);
        System.out.println("================================");

        String texto = mensagem.toLowerCase();

        if (texto.contains("atendente")
                || texto.contains("humano")
                || texto.contains("falar com alguém")
                || texto.contains("falar com alguem")) {

            atendimentosPendentesService.registrar(remetente, mensagem);

            System.out.println(
                    "Solicitação registrada. Aguardando atendimento humano."
            );

            return ResponseEntity.ok("Solicitação de atendimento registrada");
        }
        String resposta = chatbotService.responder(mensagem);
        System.out.println("================================");
        System.out.println("Resposta a mensagem");
        System.out.println(resposta);
        System.out.println("================================");
        return ResponseEntity
                .ok(resposta);
    }

    @PostMapping("/simular")
    public ResponseEntity<String> simularResposta(
            @RequestParam("From") String remetente,
            @RequestParam("Body") String mensagem
    ) {

        twilioService.enviarMensagem(remetente, mensagem);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/atendimentos-pendentes")
    public List<AtendimentoPendenteRequest> listarAtendimentosPendentes() {
        return atendimentosPendentesService.listar();
    }
}
