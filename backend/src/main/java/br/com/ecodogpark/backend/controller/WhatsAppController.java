package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições API externa", description = "Endpoints para realizar a integração da API Twilio ao back-end da aplicação")
@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {
    private final WhatsAppService whatsAppService;

    public WhatsAppController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @Operation(summary = "Listar atendimentos pendentes", description = "Requisição que retorna uma lista com as solicitações de atendimentos humano")
    @ApiResponse(responseCode = "200", description = "Busca concluída")
    @GetMapping("/atendimentos-pendentes")
    public ResponseEntity<List<AtendimentoPendenteRequest>> listarAtendimentosPendentes() {
        return ResponseEntity.ok(whatsAppService.listarAtendimentosPendentes());
    }

    @Operation(summary = "Receber e responder mensagens", description = "Requisição responsável por receber as mensagens recebidas através do WhatsApp cadastrado na Twilio e mapear a melhor resposta para aquela mensagem")
    @ApiResponse(responseCode = "200", description = "Resposta do chatbot ou confirmação da solicitação de atendimento humano")
    @ApiResponse(responseCode = "400", description = "Parâmetro From ou Body ausente")
    @PostMapping("/webhook")
    public ResponseEntity<Void> receberMensagem(
            @Parameter(description = "Número de telefone do remetente", example = "whatsapp:+5511912345678")
            @RequestParam("From") String remetente,
            @Parameter(description = "Mensagem enviada pelo remetente", example = "Qual o horário de funcionamento?")
            @RequestParam("Body") String mensagem,
            @RequestParam(value = "MessageSid", required = false) String messageSid
    ) {
        whatsAppService.processarMensagem(remetente, mensagem, messageSid);
        return ResponseEntity.ok().build();
    }
}
