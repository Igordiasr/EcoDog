package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import br.com.ecodogpark.backend.service.AtendimentosPendentesService;
import br.com.ecodogpark.backend.service.ChatbotService;
import br.com.ecodogpark.backend.service.TwilioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições API externa", description = "Endpoints para realizar a integração da API Twilio ao back-end da aplicação")
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

    @Operation(summary = "Listar atendimentos pendentes", description = "Requisição que retorna uma lista com as solicitações de atendimentos humano")
    @ApiResponse(responseCode = "200", description = "Busca concluída")
    @GetMapping("/atendimentos-pendentes")
    public ResponseEntity<List<AtendimentoPendenteRequest>> listarAtendimentosPendentes() {
        return ResponseEntity.ok(atendimentosPendentesService.listar());
    }

    @Operation(summary = "Receber e responder mensagens", description = "Requisição responsável por receber as mensagens recebidas através do WhatsApp cadastrado na Twilio e mapear a melhor resposta para aquela mensagem")
    @ApiResponse(responseCode = "200", description = "Resposta do chatbot ou confirmação da solicitação de atendimento humano")
    @ApiResponse(responseCode = "400", description = "Parâmetro From ou Body ausente")
    @PostMapping("/webhook")
    public ResponseEntity<String> receberMensagem(
            @Parameter(description = "Número de telefone do remetente", example = "whatsapp:+5511912345678")
            @RequestParam("From") String remetente,
            @Parameter(description = "Mensagem enviada pelo remetente", example = "Qual o horário de funcionamento?")
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

    @Hidden
    @PostMapping("/simular")
    public ResponseEntity<String> simularResposta(
            @RequestParam("From") String remetente,
            @RequestParam("Body") String mensagem
    ) {

        twilioService.enviarMensagem(remetente, mensagem);

        return ResponseEntity.ok().build();
    }

    @Hidden
    @PostMapping("/enviar")
    public String enviarMensagem(
            @RequestParam String numero,
            @RequestParam String mensagem
    ) {
        twilioService.enviarMensagem(numero, mensagem);
        return "Mensagem enviada";
    }
}
