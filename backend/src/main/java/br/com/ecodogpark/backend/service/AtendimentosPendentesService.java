package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TwilioDTO.AtendimentoPendenteRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AtendimentosPendentesService {
    private final AtomicLong contador = new AtomicLong(1);
    private final List<AtendimentoPendenteRequest> atendimentos = new ArrayList<>();

    public synchronized AtendimentoPendenteRequest registrar(String remetente, String mensagem) {
        AtendimentoPendenteRequest atendimento = new AtendimentoPendenteRequest(
                contador.getAndIncrement(),
                remetente,
                mensagem,
                LocalDateTime.now(),
                "PENDENTE"
        );
        atendimentos.add(atendimento);
        System.out.println("=== ATENDIMENTO HUMANO ===");
        System.out.println("Protocolo: " + atendimento.protocolo());
        System.out.println("Tutor: " + atendimento.remetente());
        System.out.println("Mensagem: " + atendimento.mensagem());
        System.out.println("Status: " + atendimento.status());
        System.out.println("==========================");
        return atendimento;
    }

    public synchronized List<AtendimentoPendenteRequest> listar() {
        return new ArrayList<>(atendimentos);
    }
}