
package br.com.ecodogpark.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutRequest;
import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.service.CheckinCheckoutService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Tag(name = "Requisições check-in e check-out", description = "Endpoints para entrada e saída dos pets")
@RestController
@RequestMapping("/checkin-checkout")
@CrossOrigin(origins = "http://localhost:5173")
public class CheckinCheckoutController {

    private final CheckinCheckoutService service;

    public CheckinCheckoutController(
            CheckinCheckoutService service
    ) {
        this.service = service;
    }

    @Operation(summary = "Listar check-ins e check-outs", description = "Lista os agendamentos da data informada. Quando omitida, utiliza o dia atual no fuso America/Sao_Paulo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operação realizada com sucesso")
    })
    @GetMapping
    public ResponseEntity<List<CheckinCheckoutResponse>> listar(
            @Parameter(description = "Data de referência (yyyy-MM-dd); quando omitida, utiliza o dia atual em America/Sao_Paulo", example = "2026-10-26")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate data
    ) {
        LocalDate dataConsulta = data != null
                ? data
                : LocalDate.now(ZoneId.of("America/Sao_Paulo"));

        return ResponseEntity.ok(
                service.listarPorData(dataConsulta)
        );
    }

    @Operation(summary = "Registrar check-in", description = "Confirma a entrada do pet e registra o responsável informado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Responsável inválido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Agendamento cancelado ou check-in já realizado", content = @Content)
    })
    @PatchMapping("/{id}/check-in")
    public ResponseEntity<Void> realizarCheckin(
            @Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody CheckinCheckoutRequest request
    ) {
        service.realizarCheckin(id, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Registrar check-out", description = "Registra a saída do pet e o responsável informado. Exige check-in prévio.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operação realizada com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Responsável inválido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Agendamento não encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Check-in ainda não realizado ou check-out já realizado", content = @Content)
    })
    @PatchMapping("/{id}/check-out")
    public ResponseEntity<Void> realizarCheckout(
            @Parameter(description = "Identificador do registro", example = "1")
            @PathVariable Long id,
            @Valid @RequestBody CheckinCheckoutRequest request
    ) {
        service.realizarCheckout(id, request);
        return ResponseEntity.noContent().build();
    }
}
