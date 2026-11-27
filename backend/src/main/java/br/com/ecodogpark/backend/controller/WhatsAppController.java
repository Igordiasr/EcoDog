package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppAtendimentoResponse;
import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppMensagemResponse;
import br.com.ecodogpark.backend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Busca concluída com sucesso"),
            @ApiResponse(responseCode = "401", description = "Autenticação ausente ou inválida"),
            @ApiResponse(responseCode = "403", description = "Usuário sem permissão para listar atendimentos")
    })
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @GetMapping("/atendimentos-pendentes")
    public ResponseEntity<List<WhatsAppAtendimentoResponse>> listarAtendimentosPendentes() {
        return ResponseEntity.ok(whatsAppService.listarAtendimentosPendentes());
    }

    @Operation(summary = "Receber e responder mensagens", description = "Requisição responsável por receber as mensagens recebidas através do WhatsApp cadastrado na Twilio e mapear a melhor resposta para aquela mensagem")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Webhook processado. O TwiML vazio informa à Twilio que não deve enviar resposta automática.",
                    content = @Content(mediaType = MediaType.APPLICATION_XML_VALUE,
                            schema = @Schema(type = "string", example = "<Response/>"))
            ),
            @ApiResponse(responseCode = "400", description = "Parâmetro From ou Body ausente"),
            @ApiResponse(responseCode = "403", description = "Assinatura da requisição Twilio ausente ou inválida")
    })
    @PostMapping("/webhook")
    public ResponseEntity<String> receberMensagem(
            @Parameter(description = "Número de telefone do remetente", example = "whatsapp:+5511912345678")
            @RequestParam("From") String remetente,
            @Parameter(description = "Mensagem enviada pelo remetente", example = "Qual o horário de funcionamento?")
            @RequestParam("Body") String mensagem,
            @Parameter(description = "Identificador único da mensagem Twilio, usado para evitar processamento duplicado", example = "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
            @RequestParam(value = "MessageSid", required = false) String messageSid,
            @Parameter(hidden = true) HttpServletRequest request,
            @Parameter(name = "X-Twilio-Signature", in = ParameterIn.HEADER,
                    description = "Assinatura usada para validar que a requisição foi enviada pela Twilio", required = true,
                    example = "assinatura-gerada-pela-twilio")
            @RequestHeader(name = "X-Twilio-Signature", required = false)
            String assinatura
    ) {
        if (!twilioWebhookValidator.validar(request, assinatura)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        whatsAppService.processarMensagem(remetente, mensagem, messageSid);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_XML).body("<Response/>");
    }

    @Operation(summary = "Assumir atendimento", description = "Transfere um atendimento pendente para atendimento humano")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Atendimento assumido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Atendimento não está em um estado que permita ser assumido"),
            @ApiResponse(responseCode = "401", description = "Autenticação ausente ou inválida"),
            @ApiResponse(responseCode = "403", description = "Usuário sem permissão para assumir atendimentos"),
            @ApiResponse(responseCode = "404", description = "Atendimento não encontrado")
    })
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @PatchMapping("/atendimentos/{idAtendimento}/assumir")
    public ResponseEntity<Void> assumirAtendimento(
            @Parameter(description = "Identificador do atendimento", example = "42", required = true)
            @PathVariable Long idAtendimento
    ) {
        whatsAppService.assumirAtendimento(idAtendimento);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Finalizar atendimento", description = "Encerra um atendimento humano em andamento")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Atendimento finalizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Atendimento não está em um estado que permita ser finalizado"),
            @ApiResponse(responseCode = "401", description = "Autenticação ausente ou inválida"),
            @ApiResponse(responseCode = "403", description = "Usuário sem permissão para finalizar atendimentos"),
            @ApiResponse(responseCode = "404", description = "Atendimento não encontrado")
    })
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @PatchMapping("/atendimentos/{idAtendimento}/finalizar")
    public ResponseEntity<Void> finalizarAtendimento(
            @Parameter(description = "Identificador do atendimento", example = "42", required = true)
            @PathVariable Long idAtendimento
    ) {
        whatsAppService.finalizarAtendimento(idAtendimento);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Consultar histórico de mensagens", description = "Retorna as mensagens vinculadas a um atendimento")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Histórico consultado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Autenticação ausente ou inválida"),
            @ApiResponse(responseCode = "403", description = "Usuário sem permissão para consultar o histórico"),
            @ApiResponse(responseCode = "404", description = "Atendimento não encontrado")
    })
    @PreAuthorize("hasAnyRole('MONITOR', 'ADMINISTRADOR')")
    @GetMapping("/atendimentos/{idAtendimento}/mensagens")
    public ResponseEntity<List<WhatsAppMensagemResponse>> listarMensagens(
            @Parameter(description = "Identificador do atendimento", example = "42", required = true)
            @PathVariable Long idAtendimento
    ) {
        return ResponseEntity.ok(whatsAppService.listarMensagens(idAtendimento));
    }
}
