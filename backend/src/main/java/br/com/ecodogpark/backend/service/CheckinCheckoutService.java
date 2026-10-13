
package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.CheckinCheckoutRequest;
import br.com.ecodogpark.backend.dto.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.repository.AgendamentosRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class CheckinCheckoutService {

    private static final ZoneId FUSO_HORARIO =
            ZoneId.of("America/Sao_Paulo");

    private final AgendamentosRepository agendamentosRepository;

    public CheckinCheckoutService(
            AgendamentosRepository agendamentosRepository
    ) {
        this.agendamentosRepository = agendamentosRepository;
    }

    public List<CheckinCheckoutResponse> listarPorData(LocalDate data) {
        return agendamentosRepository.listarPorData(data);
    }

    @Transactional
    public void realizarCheckin(
            Long id,
            CheckinCheckoutRequest request
    ) {
        AgendamentosEntity agendamento = buscarAgendamento(id);

        if (agendamento.getDataEntrada() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O check-in deste pet já foi realizado."
            );
        }

        if (agendamento.getDataSaida() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O agendamento já possui check-out registrado."
            );
        }

        agendamento.setDataEntrada(
                LocalDateTime.now(FUSO_HORARIO)
        );
        agendamento.setTutorCheckin(request.responsavel());
        agendamento.setSituacao("PRESENTE");

        agendamentosRepository.save(agendamento);
    }

    @Transactional
    public void realizarCheckout(
            Long id,
            CheckinCheckoutRequest request
    ) {
        AgendamentosEntity agendamento = buscarAgendamento(id);

        if (agendamento.getDataEntrada() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível realizar check-out sem check-in."
            );
        }

        if (agendamento.getDataSaida() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O check-out deste pet já foi realizado."
            );
        }

        agendamento.setDataSaida(
                LocalDateTime.now(FUSO_HORARIO)
        );
        agendamento.setTutorCheckout(request.responsavel());
        agendamento.setSituacao("FINALIZADO");

        agendamentosRepository.save(agendamento);
    }

    private AgendamentosEntity buscarAgendamento(Long id) {
        return agendamentosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Agendamento não encontrado."
                ));
    }
}