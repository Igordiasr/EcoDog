package br.com.ecodogpark.backend.controller;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.VagasDisponiveisResponse;
import br.com.ecodogpark.backend.service.AgendamentoTutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoTutorController {
    private final AgendamentoTutorService agendamentoTutorService;

    public AgendamentoTutorController(AgendamentoTutorService agendamentoTutorService) {
        this.agendamentoTutorService = agendamentoTutorService;
    }

    @GetMapping("/calendario")
    public ResponseEntity<List<VagasDisponiveisResponse>> buscarDisponibilidade(@RequestParam String servico,
                                                                                @RequestParam Integer ano,
                                                                                @RequestParam Integer mes) {

        List<VagasDisponiveisResponse> disponibilidade = agendamentoTutorService.buscarDisponibilidade(servico, ano, mes);

        return ResponseEntity.ok(disponibilidade);
    }
}
