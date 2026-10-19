
package br.com.ecodogpark.backend.controller;

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

    @GetMapping
    public ResponseEntity<List<CheckinCheckoutResponse>> listar(
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

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<Void> realizarCheckin(
            @PathVariable Long id,
            @Valid @RequestBody CheckinCheckoutRequest request
    ) {
        service.realizarCheckin(id, request);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/check-out")
    public ResponseEntity<Void> realizarCheckout(
            @PathVariable Long id,
            @Valid @RequestBody CheckinCheckoutRequest request
    ) {
        service.realizarCheckout(id, request);
        return ResponseEntity.noContent().build();
    }
}
