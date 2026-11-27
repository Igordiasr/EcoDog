package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppAtendimentoResponse;
import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppMensagemResponse;
import br.com.ecodogpark.backend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Requisições API externa", description = "Endpoints para realizar a integração da API Twilio ao back-end da aplicação")
@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {
    private final WhatsAppService whatsAppService;
    private final TwilioWebhookValidator twilioWebhookValidator;

    public WhatsAppController(
            WhatsAppService whatsAppService,
            TwilioWebhookValidator twilioWebhookValidator
    ) {
        this.whatsAppService = whatsAppService;
        this.twilioWebhookValidator = twilioWebhookValidator;
    }

    @Operation(summary = "Listar atendimentos pendentes", description = "Requisição que retorna uma lista com as solicitações de atendimentos humano")
    @ApiResponse(responseCode = "200", description = "Busca concluída")
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @GetMapping("/atendimentos-pendentes")
    public ResponseEntity<List<WhatsAppAtendimentoResponse>> listarAtendimentosPendentes() {
        return ResponseEntity.ok(whatsAppService.listarAtendimentosPendentes());
    }

    @Operation(summary = "Receber e responder mensagens", description = "Requisição responsável por receber as mensagens recebidas através do WhatsApp cadastrado na Twilio e mapear a melhor resposta para aquela mensagem")
    @ApiResponse(responseCode = "200", description = "Resposta do chatbot ou confirmação da solicitação de atendimento humano")
    @ApiResponse(responseCode = "400", description = "Parâmetro From ou Body ausente")
    @PostMapping("/webhook")
    public ResponseEntity<String> receberMensagem(
            @Parameter(description = "Número de telefone do remetente", example = "whatsapp:+5511912345678")
            @RequestParam("From") String remetente,
            @Parameter(description = "Mensagem enviada pelo remetente", example = "Qual o horário de funcionamento?")
            @RequestParam("Body") String mensagem,
            @RequestParam(value = "MessageSid", required = false) String messageSid,
            HttpServletRequest request,
            @RequestHeader(name = "X-Twilio-Signature", required = false)
            String assinatura
    ) {
        if (!twilioWebhookValidator.validar(request, assinatura)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        whatsAppService.processarMensagem(remetente, mensagem, messageSid);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body("<Response/>");
    }

    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @PatchMapping("/atendimentos/{idAtendimento}/assumir")
    public ResponseEntity<Void> assumirAtendimento(@PathVariable Long idAtendimento) {
        whatsAppService.assumirAtendimento(idAtendimento);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @PatchMapping("/atendimentos/{idAtendimento}/finalizar")
    public ResponseEntity<Void> finalizarAtendimento(@PathVariable Long idAtendimento) {
        whatsAppService.finalizarAtendimento(idAtendimento);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Consultar histórico de mensagens", description = "Retorna as mensagens vinculadas a um atendimento")
    @ApiResponse(responseCode = "200", description = "Histórico consultado com sucesso")
    @ApiResponse(responseCode = "404", description = "Atendimento não encontrado")
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @GetMapping("/atendimentos/{idAtendimento}/mensagens")
    public ResponseEntity<List<WhatsAppMensagemResponse>> listarMensagens(@PathVariable Long idAtendimento) {
        return ResponseEntity.ok(whatsAppService.listarMensagens(idAtendimento));
    }
}
