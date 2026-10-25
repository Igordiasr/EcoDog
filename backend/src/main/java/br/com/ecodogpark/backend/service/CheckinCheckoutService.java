
package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutRequest;
import br.com.ecodogpark.backend.dto.CheckinCheckoutDTO.CheckinCheckoutResponse;
import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;

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

    private final AgendamentoRepository agendamentoRepository;

    public CheckinCheckoutService(
            AgendamentoRepository agendamentoRepository
    ) {
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<CheckinCheckoutResponse> listarPorData(LocalDate data) {
        return agendamentoRepository.listarPorData(data);
    }

    @Transactional
    public void realizarCheckin(
            Long id,
            CheckinCheckoutRequest requisicao
    ) {
        AgendamentosEntity agendamento = buscarAgendamento(id);

        if (agendamento.getSituacao() != SituacaoAgendamento.AGENDADO) {
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
        agendamento.setTutorCheckin(requisicao.responsavel());
        agendamento.setSituacao(SituacaoAgendamento.CONFIRMADO);

        agendamentoRepository.save(agendamento);
    }

    @Transactional
    public void realizarCheckout(
            Long id,
            CheckinCheckoutRequest requisicao
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
        agendamento.setTutorCheckout(requisicao.responsavel());
        agendamento.setSituacao(SituacaoAgendamento.RETIRADO);

        agendamentoRepository.save(agendamento);
    }

    private AgendamentosEntity buscarAgendamento(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Agendamento não encontrado."
                ));
    }
}