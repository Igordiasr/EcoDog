package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.DiaSemana;
import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import br.com.ecodogpark.backend.exception.NenhumPetSelecionadoException;
import br.com.ecodogpark.backend.exception.PetNaoEncontradoException;
import br.com.ecodogpark.backend.exception.PetSemAdaptacaoException;
import br.com.ecodogpark.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class  AgendamentoTutorService {
    private final AgendamentoRepository agendamentoRepository;
    private final CalendarioRepository calendarioRepository;
    private final PetRepository petRepository;
    private final ServicosRepository servicosRepository;
    private final ContratoRepository contratoRepository;
    private final MovimentacoesRepository movimentacoesRepository;
    private final ContratoDiasSemanaRepository contratoDiasSemanaRepository;
    private static final Integer capacidadePadrao = 10;

    public AgendamentoTutorService(AgendamentoRepository agendamentoRepository,
                                   CalendarioRepository calendarioRepository,
                                   PetRepository petRepository,
                                   ServicosRepository servicosRepository,
                                   ContratoRepository contratoRepository,
                                   MovimentacoesRepository movimentacoesRepository,
                                   ContratoDiasSemanaRepository contratoDiasSemanaRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.calendarioRepository = calendarioRepository;
        this.petRepository = petRepository;
        this.servicosRepository = servicosRepository;
        this.contratoRepository = contratoRepository;
        this.movimentacoesRepository = movimentacoesRepository;
        this.contratoDiasSemanaRepository = contratoDiasSemanaRepository;
    }

    public List<PetsDoTutorResponse> buscarPets(UUID idUsuario) {
        List<PetsEntity> pets = petRepository.findByFkUsuarioIdUsuario(idUsuario);
        List<PetsDoTutorResponse> petsDoTutor = new ArrayList<>();

        for (PetsEntity pet : pets) {
            PetsDoTutorResponse response = paraDtoPetTutor(pet);
            petsDoTutor.add(response);
        }

        return petsDoTutor;
    }

    public List<ServicoAtivoResponse> listarServicos(String servico) {
        servico = formatar(servico);
        validarServico(servico);

        return servicosRepository.buscarServicosAtivos(servico);
    }

    public List<VagasDisponiveisResponse> buscarDisponibilidade (String servico, Integer ano, Integer mes) {
        servico = formatar(servico);
        validarServico(servico);

        YearMonth mesEscolhido = YearMonth.of(ano, mes);
        LocalDate primeiroDia = mesEscolhido.atDay(1);
        LocalDate ultimoDia = mesEscolhido.atEndOfMonth();

        Map<LocalDate, CalendarioEntity> calendario = buscarCalendarioPorData(primeiroDia, ultimoDia);
        Map<LocalDate, Long> agendamentos = buscarAgendamentosPorData(servico, primeiroDia, ultimoDia);

        List<VagasDisponiveisResponse> responses = new ArrayList<>();

        for (LocalDate data = primeiroDia; !data.isAfter(ultimoDia); data = data.plusDays(1)) {
            int capacidade = capacidadeDoDia(servico, calendario.get(data));
            long agendados = agendamentos.getOrDefault(data, 0L);

            long vagasDisponiveis = Math.max(0L, capacidade - agendados);

            responses.add(new VagasDisponiveisResponse(
                    data,
                    servico,
                    capacidade,
                    vagasDisponiveis
            ));
        }
        return responses;
    }

//    public List<AgendamentosTutorResponse> buscarAgendamentosDoTutor(UUID idUsuario, Integer ano, Integer mes) {
//        YearMonth mesEscolhido = YearMonth.of(ano, mes);
//        LocalDate primeiroDia = mesEscolhido.atDay(1);
//        LocalDate ultimoDia = mesEscolhido.atEndOfMonth();
//
//        return agendamentoRepository.buscarAgendamentosDoTutor(
//                idUsuario,
//                primeiroDia,
//                ultimoDia,
//                List.of(SituacaoAgendamento.AGENDADO, SituacaoAgendamento.CONFIRMADO)
//        );
//    }

    public OrcamentoResponse calcularOrcamento(OrcamentoRequest request, UUID idUsuario) {
        ServicosEntity servico = buscarServicoEscolhido(request.idServico());

        if ("PLANO".equals(servico.getModalidade())) {
           validarDiasSelecionadosDoPlano(servico, request.diasSemana());
        }

        List<LocalDate> datas = verificarDatasEscolhidas(servico, request);
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);

        BigDecimal valorTotal = calcularValorTotal(servico, datas, pets.size());

        return new OrcamentoResponse(
                servico.getNome(),
                servico.getModalidade(),
                pets.stream().map(PetsEntity::getNome).toList(),
                datas,
                valorTotal
        );
    }

    @Transactional
    public AgendamentoCriadoResponse criarAgendamento(OrcamentoRequest request, UUID idUsuario) {
        ServicosEntity servico = buscarServicoEscolhido(request.idServico());

        if ("PLANO".equals(servico.getModalidade())) {
            return contratarPlano(servico, request, idUsuario);
        }
        return agendarPorDia(servico, request, idUsuario);
    }

    private String formatar(String servico) {
        return servico == null ? null : servico.trim().toUpperCase();
    }

    private Map<LocalDate, CalendarioEntity> buscarCalendarioPorData(LocalDate inicio, LocalDate fim) {
        return calendarioRepository.buscarCalendario(inicio, fim).stream()
                .collect(Collectors.toMap(
                        CalendarioEntity::getData,
                        cal -> cal
                ));
    }

    private Map<LocalDate, Long> buscarAgendamentosPorData(String servico, LocalDate inicio, LocalDate fim) {
        LocalDateTime inicioHora = inicio.atStartOfDay();
        LocalDateTime fimHora = fim.plusDays(1).atStartOfDay();

        return agendamentoRepository.buscarAgendamentoPorServico(servico, inicioHora, fimHora).stream()
                .collect(Collectors.toMap(
                        DiasComAgendamentoResponse::data,
                        DiasComAgendamentoResponse::totalPetsAgendados
                ));
    }

    private AgendamentoCriadoResponse agendarPorDia(ServicosEntity servico, OrcamentoRequest request, UUID idUsuario) {
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);
        List<LocalDate> datas = verificarDatasEscolhidas(servico, request);
        String servicoCategoria = servico.getCategoria();

        for (LocalDate data : datas) {
            validarDisponibilidadeDoDia(servicoCategoria, data, pets);
        }

        boolean tutorAprovado = false;
        if ("DAYUSE".equals(servicoCategoria)) {
            tutorAprovado = contratoRepository.existsByPetFkUsuarioIdUsuarioAndSituacaoIn(idUsuario, List.of("ATIVO", "ENCERRADO"));
        }

        String situacaoContrato = tutorAprovado ? "ATIVO" : "PENDENTE";
        SituacaoAgendamento situacaoAgendamento = tutorAprovado ? SituacaoAgendamento.AGENDADO : SituacaoAgendamento.PENDENTE;

        BigDecimal valorPorPet = calcularValorTotal(servico, datas, 1);

        for (PetsEntity pet : pets) {
            ContratosEntity contrato = salvarContrato(pet, servico, datas, valorPorPet, situacaoContrato);
            salvarMovimentacao(contrato, valorPorPet);

            for (LocalDate data : datas) {
                AgendamentosEntity agendamento = paraEntityAgendamentos(pet, data, servicoCategoria, situacaoAgendamento);
                agendamentoRepository.save(agendamento);
            }
        }

        BigDecimal total = valorPorPet.multiply(BigDecimal.valueOf(pets.size()));
        return new AgendamentoCriadoResponse(
                total,
                !tutorAprovado
        );
    }

    private AgendamentoCriadoResponse contratarPlano(ServicosEntity servico, OrcamentoRequest request, UUID idUsuario) {
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);
        LocalDate inicio = validarDataInicioPlano(request.dataInicioPlano());
        LocalDate fim = inicio.plusMonths(1).minusDays(1);

        for (PetsEntity pet : pets) {
            if (contratoRepository.existePlanoSobreposto(pet.getIdPet(), inicio, fim)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, pet.getNome() + " já possui um plano nesse período");
            }
        }

        validarDiasSelecionadosDoPlano(servico, request.diasSemana());
        BigDecimal valorPorPet = calcularValorTotal(servico, List.of(inicio), 1);

        for (PetsEntity pet : pets) {
            ContratosEntity contrato = salvarContrato(pet, servico, List.of(inicio, fim), valorPorPet, "PENDENTE");
            salvarMovimentacao(contrato, valorPorPet);
            salvarDiasDaSemana(contrato, request.diasSemana());
        }

        return new AgendamentoCriadoResponse(
                valorPorPet.multiply(BigDecimal.valueOf(pets.size())),
                true
        );
    }

    private List<PetsEntity> buscarPetsEscolhidos(List<UUID> ids, UUID idUsuario) {
        if (ids == null || ids.isEmpty()) {
            throw new NenhumPetSelecionadoException("Selecione ao menos um pet");
        }

        List<UUID> idsDistintos = ids.stream().distinct().toList();
        List<PetsEntity> pets = petRepository.findByIdPetInAndFkUsuarioIdUsuario(idsDistintos, idUsuario);

        if (pets.size() != idsDistintos.size()) {
            throw new PetNaoEncontradoException("Pet não encontrado para este tutor");
        }

        for (PetsEntity pet : pets) {
            if (!Boolean.TRUE.equals(pet.getStatusAdaptacao())) {
                throw new PetSemAdaptacaoException(pet.getNome() + " não possui adaptação na Ecodog.");
            }
        }

        return pets;
    }

    private int capacidadeDoDia(String servico, CalendarioEntity calendario) {
        if ("HOTEL".equals(servico)) {
            return (calendario == null || calendario.getVagasHotel() == null)
                    ? capacidadePadrao
                    : calendario.getVagasHotel();
        }
        return (calendario == null || calendario.getVagasCreche() == null)
                ? capacidadePadrao
                : calendario.getVagasCreche();
    }

    private List<LocalDate> verificarDatasEscolhidas(ServicosEntity servico, OrcamentoRequest request) {
        if ("PLANO".equals(servico.getModalidade())) {
            return List.of(validarDataInicioPlano(request.dataInicioPlano()));
        }
        return validarDatasDeUtilizacao(request.datasUtilizacao());
    }

    private BigDecimal calcularValorTotal(ServicosEntity servico, List<LocalDate> datas, Integer quantidadePets) {
        int quantidadeDias = "PLANO".equals(servico.getModalidade()) ? 1 : datas.size();

        return servico.getValor()
                .multiply(BigDecimal.valueOf(quantidadeDias))
                .multiply(BigDecimal.valueOf(quantidadePets))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void salvarDiasDaSemana(ContratosEntity contrato, List<DiaSemana> diasSemanas) {
        for (DiaSemana diaSemana : diasSemanas) {
            ContratoDiasSemanaEntity entity = new ContratoDiasSemanaEntity();
            entity.setContrato(contrato);
            entity.setDiaSemana(diaSemana);

            contratoDiasSemanaRepository.save(entity);
        }
    }

    private ContratosEntity salvarContrato(PetsEntity pet, ServicosEntity servico, List<LocalDate> datas, BigDecimal valor, String situacao) {
        ContratosEntity contrato = new ContratosEntity();
        contrato.setPet(pet);
        contrato.setServicos(servico);
        contrato.setDataInicio(datas.getFirst());
        contrato.setDataFim(datas.getLast());
        contrato.setValor(valor);
        contrato.setSituacao(situacao);
        return contratoRepository.save(contrato);
    }

    private void salvarMovimentacao(ContratosEntity contrato, BigDecimal valor) {
        MovimentacoesEntity movimentacao = new MovimentacoesEntity();
        movimentacao.setContrato(contrato);
        movimentacao.setValor(valor);
        movimentacao.setDataRegistro(LocalDate.now());
        movimentacao.setSituacao("PENDENTE");
        movimentacoesRepository.save(movimentacao);
    }

    private CalendarioEntity buscarOuCriarCalendario(LocalDate data) {
        return calendarioRepository.findByData(data).orElseGet(() -> {
            CalendarioEntity calendario = new CalendarioEntity();
            calendario.setData(data);
            calendario.setVagasCreche(capacidadePadrao);
            calendario.setVagasHotel(capacidadePadrao);
            return calendarioRepository.save(calendario);
        });
    }

    private PetsDoTutorResponse paraDtoPetTutor(PetsEntity pet) {
        return new PetsDoTutorResponse(
                pet.getIdPet(),
                pet.getNome(),
                pet.getStatusAdaptacao()
        );
    }

    private AgendamentosEntity paraEntityAgendamentos(PetsEntity pet, LocalDate data, String servico, SituacaoAgendamento situacaoAgendamento) {
        AgendamentosEntity agendamento = new AgendamentosEntity();
        agendamento.setFkPet(pet);
        agendamento.setFkCalendario(buscarOuCriarCalendario(data));
        agendamento.setDataEntrada(data.atStartOfDay());
        agendamento.setServico(servico);
        agendamento.setSituacao(situacaoAgendamento);
        return agendamento;
    }

    private void validarDiasSelecionadosDoPlano(ServicosEntity servico, List<DiaSemana> diaSemanas) {
        if (diaSemanas == null || diaSemanas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione os dias da semana do plano");
        }
        if (diaSemanas.stream().distinct().count() != diaSemanas.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é permitido selecionar dias repetidos");
        }

        int frequencia = Integer.parseInt(servico.getFrequencia());
        if (diaSemanas.size() != frequencia) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este plano exige a seleção de " + frequencia + " dias da semana");

        }
    }

    private void validarServico(String servico) {
        if (servico == null || servico.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um serviço.");
        }
        if (!List.of("CRECHE", "DAYUSE", "HOTEL").contains(servico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido.");
        }
    }

    private void validarDisponibilidadeDoDia(String servico, LocalDate data, List<PetsEntity> pets) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.plusDays(1).atStartOfDay();

        CalendarioEntity calendario = calendarioRepository.findByData(data).orElse(null);
        long ocupadas = agendamentoRepository.buscarAgendamentoPorServico(servico, inicio, fim)
                .stream().mapToLong(DiasComAgendamentoResponse::totalPetsAgendados).sum();

        long livres = capacidadeDoDia(servico, calendario) - ocupadas;

        if (livres < pets.size()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sem vagas suficientes em " + data + ".");
        }

        for (PetsEntity pet : pets) {
            if (agendamentoRepository.petJaAgendado(pet.getIdPet(), inicio, fim)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, pet.getNome() + " já possui agendamento em " + data + ".");
            }
        }
    }

    private List<LocalDate> validarDatasDeUtilizacao(List<LocalDate> datas) {
        if (datas == null || datas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione ao menos uma data");
        }
        List<LocalDate> ordenadas = datas.stream().distinct().sorted().toList();

        if (ordenadas.getFirst().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível agendar datas passadas.");
        }
        return ordenadas;
    }

    private LocalDate validarDataInicioPlano(LocalDate dataInicio) {
        if (dataInicio == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a data de inicio.");
        }
        if (dataInicio.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data de início não pode ser passada.");
        }
        return dataInicio;
    }

    private ServicosEntity buscarServicoEscolhido(Integer idServico) {
        if (idServico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um serviço válido");
        }
        return servicosRepository.findById(idServico).filter(s -> Boolean.TRUE.equals(s.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado ou inativo"));
    }
}