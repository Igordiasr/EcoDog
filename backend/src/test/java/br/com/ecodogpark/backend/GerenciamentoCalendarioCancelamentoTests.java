package br.com.ecodogpark.backend;

import br.com.ecodogpark.backend.entity.AgendamentosEntity;
import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.AtividadesGerenciamentoRepository;
import br.com.ecodogpark.backend.repository.CalendarioGerenciamentoRepository;
import br.com.ecodogpark.backend.repository.ParticipacaoDoPetRepository;
import br.com.ecodogpark.backend.service.GerenciamentoCalendarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GerenciamentoCalendarioCancelamentoTests {
    private AgendamentoRepository agendamentos;
    private GerenciamentoCalendarioService servico;

    @BeforeEach
    void preparar() {
        agendamentos = mock(AgendamentoRepository.class);
        servico = new GerenciamentoCalendarioService(mock(CalendarioGerenciamentoRepository.class),
                mock(AtividadesGerenciamentoRepository.class), mock(AtividadeDoDiaRepository.class),
                agendamentos, mock(ParticipacaoDoPetRepository.class));
    }

    @Test
    void cancelaAgendamentosPendentesOuAgendadosSemExcluirORegistro() {
        for (SituacaoAgendamento situacao : new SituacaoAgendamento[]{SituacaoAgendamento.PENDENTE, SituacaoAgendamento.AGENDADO}) {
            AgendamentosEntity agendamento = new AgendamentosEntity();
            agendamento.setSituacao(situacao);
            agendamento.setDataEntrada(LocalDateTime.of(2026, 11, 15, 0, 0));
            when(agendamentos.buscarPorIdParaAtualizacao(15L)).thenReturn(Optional.of(agendamento));

            servico.cancelarAgendamento(15L, SituacaoAgendamento.CANCELADO);

            assertEquals(SituacaoAgendamento.CANCELADO, agendamento.getSituacao());
            assertEquals(LocalDateTime.of(2026, 11, 15, 0, 0), agendamento.getDataEntrada());
            verify(agendamentos).save(agendamento);
            verify(agendamentos, never()).delete(any());
            reset(agendamentos);
        }
    }

    @Test
    void rejeitaAgendamentosJaCanceladosOuComEntradaOuSaida() {
        for (SituacaoAgendamento situacao : new SituacaoAgendamento[]{SituacaoAgendamento.CANCELADO, SituacaoAgendamento.CONFIRMADO, SituacaoAgendamento.RETIRADO}) {
            AgendamentosEntity agendamento = new AgendamentosEntity();
            agendamento.setSituacao(situacao);
            when(agendamentos.buscarPorIdParaAtualizacao(15L)).thenReturn(Optional.of(agendamento));
            var erro = assertThrows(ResponseStatusException.class, () -> servico.cancelarAgendamento(15L, SituacaoAgendamento.CANCELADO));
            assertEquals(HttpStatus.CONFLICT, erro.getStatusCode());
            assertEquals(situacao, agendamento.getSituacao());
        }
        verify(agendamentos, never()).save(any());
    }

    @Test
    void rejeitaEntradaRegistradaMesmoComSituacaoInconsistente() {
        AgendamentosEntity agendamento = new AgendamentosEntity();
        agendamento.setSituacao(SituacaoAgendamento.AGENDADO);
        agendamento.setTutorCheckin("Responsável");
        when(agendamentos.buscarPorIdParaAtualizacao(15L)).thenReturn(Optional.of(agendamento));
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class,
                () -> servico.cancelarAgendamento(15L, SituacaoAgendamento.CANCELADO)).getStatusCode());
        verify(agendamentos, never()).save(any());
    }

    @Test
    void validaSolicitacaoEAgendamentoExistente() {
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> servico.cancelarAgendamento(15L, SituacaoAgendamento.CONFIRMADO)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class,
                () -> servico.cancelarAgendamento(0L, SituacaoAgendamento.CANCELADO)).getStatusCode());
        when(agendamentos.buscarPorIdParaAtualizacao(15L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class,
                () -> servico.cancelarAgendamento(15L, SituacaoAgendamento.CANCELADO)).getStatusCode());
        verify(agendamentos, never()).save(any());
    }
}
