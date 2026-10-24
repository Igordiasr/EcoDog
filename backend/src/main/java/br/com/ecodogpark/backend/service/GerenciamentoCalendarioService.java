package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.util.List;

@Service
public class GerenciamentoCalendarioService {
    private final CalendarioGerenciamentoRepository calendarioRepositorio;
    private final AtividadesGerenciamentoRepository atividadesRepositorio;
    private final AtividadeDoDiaRepository atividadesDoDiaRepositorio;
    private final AgendamentoRepository agendamentosRepositorio;
    private final ParticipacaoDoPetRepository participacaoRepositorio;

    public GerenciamentoCalendarioService(
            CalendarioGerenciamentoRepository calendarioRepositorio,
            AtividadesGerenciamentoRepository atividadesRepositorio,
            AtividadeDoDiaRepository atividadesDoDiaRepositorio,
            AgendamentoRepository agendamentosRepositorio,
            ParticipacaoDoPetRepository participacaoRepositorio) {
        this.calendarioRepositorio = calendarioRepositorio;
        this.atividadesRepositorio = atividadesRepositorio;
        this.atividadesDoDiaRepositorio = atividadesDoDiaRepositorio;
        this.agendamentosRepositorio = agendamentosRepositorio;
        this.participacaoRepositorio = participacaoRepositorio;
    }

    @Transactional(readOnly = true)
    public List<LocalDate> listarDiasConfigurados(YearMonth mes) {
        return calendarioRepositorio.findByDataBetweenOrderByDataAsc(
                mes.atDay(1), mes.atEndOfMonth()).stream()
                .map(CalendarioEntity::getData)
                .toList();
    }

    @Transactional(readOnly = true)
    public CalendarioDiaResponse buscarDia(LocalDate data) {
        CalendarioEntity calendario = calendarioRepositorio.findByData(data)
                .orElse(null);
        List<AtividadeCalendarioResponse> atividades = calendario == null ? List.of()
                : atividadesDoDiaRepositorio.findByFkCalendarioIdCalendarioOrderByHoraInicioAsc(
                        calendario.getIdCalendario()).stream()
                .map(this::converterAtividade)
                .toList();

        List<AlunoAgendadoResponse> alunos = agendamentosRepositorio.listarAgendamentosDoDia(data)
                .stream().map(agendamento -> {
                    PetsEntity pet = agendamento.getFkPet();
                    UsuariosEntity tutor = pet.getFkUsuario();
                    int idade = Period.between(pet.getDataNascimento(), data).getYears();
                    return new AlunoAgendadoResponse(
                            agendamento.getIdAgendamentos(), pet.getIdPet(), pet.getNome(),
                            pet.getRaca(), idade, tutor.getNome(),
                            agendamento.getSituacao() == null ? null : agendamento.getSituacao().name());
                }).toList();

        return new CalendarioDiaResponse(
                calendario == null ? null : calendario.getIdCalendario(),
                data,
                calendario == null ? 0 : calendario.getVagasCreche(),
                calendario == null ? 0 : calendario.getVagasHotel(),
                atividades, alunos);
    }

    @Transactional
    public CalendarioDiaResponse atualizarVagas(LocalDate data, VagasCalendarioRequest requisicao) {
        CalendarioEntity calendario = obterOuCriarCalendario(data);
        calendario.setVagasCreche(requisicao.vagasCreche());
        calendario.setVagasHotel(requisicao.vagasHotel());
        calendarioRepositorio.save(calendario);
        return buscarDia(data);
    }

    @Transactional
    public AtividadeCalendarioResponse adicionarAtividade(
            LocalDate data, AdicionarAtividadeCalendarioRequest requisicao) {
        if (requisicao.horaFim().compareTo(requisicao.horaInicio()) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "O horário final deve ser posterior ao horário inicial.");
        }
        CalendarioEntity calendario = obterOuCriarCalendario(data);
        AtividadesEntity atividade = atividadesRepositorio.findById(requisicao.idAtividade())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Atividade não encontrada."));
        boolean conflito = atividadesDoDiaRepositorio
                .findByFkCalendarioIdCalendarioOrderByHoraInicioAsc(calendario.getIdCalendario())
                .stream().anyMatch(existente ->
                        requisicao.horaInicio().isBefore(existente.getHoraFim())
                        && requisicao.horaFim().isAfter(existente.getHoraInicio()));
        if (conflito) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "O horário informado conflita com outra atividade deste dia.");
        }

        AtividadesDoDiaEntity atividadeDoDia = new AtividadesDoDiaEntity();
        atividadeDoDia.setFkAtividade(atividade);
        atividadeDoDia.setFkCalendario(calendario);
        atividadeDoDia.setHoraInicio(requisicao.horaInicio());
        atividadeDoDia.setHoraFim(requisicao.horaFim());
        atividadeDoDia.setSituacao("PENDENTE");
        return converterAtividade(atividadesDoDiaRepositorio.save(atividadeDoDia));
    }

    @Transactional
    public void removerAtividade(Long idAtividadeDoDia) {
        if (!atividadesDoDiaRepositorio.existsById(idAtividadeDoDia)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade programada não encontrada.");
        }
        if (participacaoRepositorio.existsByFkAtividadesDoDiaIdAtividadeDoDia(idAtividadeDoDia)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não é possível remover uma atividade que já possui pets vinculados.");
        }
        atividadesDoDiaRepositorio.deleteById(idAtividadeDoDia);
    }

    @Transactional(readOnly = true)
    public List<AtividadeCalendarioResponse> listarCatalogoAtividades() {
        return atividadesRepositorio.findAllByOrderByNomeAsc().stream()
                .map(atividade -> new AtividadeCalendarioResponse(
                        null, atividade.getIdAtividades(), atividade.getNome(),
                        atividade.getDescricao(), atividade.getCategoria(),
                        null, null, null))
                .toList();
    }

    private CalendarioEntity obterOuCriarCalendario(LocalDate data) {
        return calendarioRepositorio.findByData(data).orElseGet(() -> {
            CalendarioEntity novoCalendario = new CalendarioEntity();
            novoCalendario.setData(data);
            novoCalendario.setVagasCreche(0);
            novoCalendario.setVagasHotel(0);
            return calendarioRepositorio.save(novoCalendario);
        });
    }

    private AtividadeCalendarioResponse converterAtividade(AtividadesDoDiaEntity atividadeDoDia) {
        AtividadesEntity atividade = atividadeDoDia.getFkAtividade();
        return new AtividadeCalendarioResponse(
                atividadeDoDia.getIdAtividadeDoDia(), atividade.getIdAtividades(),
                atividade.getNome(), atividade.getDescricao(), atividade.getCategoria(),
                atividadeDoDia.getHoraInicio(), atividadeDoDia.getHoraFim(),
                atividadeDoDia.getSituacao());
    }
}
