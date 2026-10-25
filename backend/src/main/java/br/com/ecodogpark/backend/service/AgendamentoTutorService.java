package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AgendamentoTutorService {
    private final AgendamentosRepository agendamentosRepository;
    private final CalendarioRepository calendarioRepository;
    private final PetsRepository petsRepository;
    private final ServicosRepository servicosRepository;
    private final ContratosRepository contratosRepository;
    private final MovimentacoesRepository movimentacoesRepository;
    private static final Integer capacidadePadrao = 10;

    public AgendamentoTutorService(AgendamentosRepository agendamentosRepository,
                                   CalendarioRepository calendarioRepository,
                                   PetsRepository petsRepository,
                                   ServicosRepository servicosRepository,
                                   ContratosRepository contratosRepository,
                                   MovimentacoesRepository movimentacoesRepository) {
        this.agendamentosRepository = agendamentosRepository;
        this.calendarioRepository = calendarioRepository;
        this.petsRepository = petsRepository;
        this.servicosRepository = servicosRepository;
        this.contratosRepository = contratosRepository;
        this.movimentacoesRepository = movimentacoesRepository;
    }

    public List<PetsDoTutorResponse> buscarPets(Long idUsuario) {
        List<PetsEntity> pets = petsRepository.findByFkUsuarioIdUsuario(idUsuario);
        List<PetsDoTutorResponse> petsDoTutor = new ArrayList<>();

        for (PetsEntity pet : pets) {
            PetsDoTutorResponse response = paraDtoPetTutor(pet);
            petsDoTutor.add(response);
        }

        return petsDoTutor;
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

    public List<AgendamentosTutorResponse> buscarAgendamentosDoTutor(Long idUsuario, Integer ano, Integer mes) {
        YearMonth mesEscolhido = YearMonth.of(ano, mes);
        LocalDate primeiroDia = mesEscolhido.atDay(1);
        LocalDate ultimoDia = mesEscolhido.atEndOfMonth();

        return agendamentosRepository.buscarAgendamentosDoTutor(
                idUsuario,
                primeiroDia,
                ultimoDia,
                List.of(SituacaoAgendamento.AGENDADO, SituacaoAgendamento.CONFIRMADO)
        );
    }

    public List<ServicoAtivoResponse> listarServicos(String servico) {
        servico = formatar(servico);
        validarServico(servico);

        return servicosRepository.buscarServicosAtivos(servico);
    }

    public OrcamentoResponse calcularOrcamento(OrcamentoRequest request, Long idUsuario) {
        ServicosEntity servico = buscarServicoEscolhido(request.idServico());
        List<LocalDate> datas = definirDatasEscolhidas(servico, request);
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
    public AgendamentoCriadoResponse criarAgendamento(OrcamentoRequest request, Long idUsuario) {
        ServicosEntity servico = buscarServicoEscolhido(request.idServico());

        if ("PLANO".equals(servico.getModalidade())) {
            return contratarPlano(servico, request, idUsuario);
        }
        return agendarPorDia(servico, request, idUsuario);
    }

    @Transactional
    public AgendamentoPlanoResponse agendarPeloPlano(OrcamentoRequest request, Long idUsuario) {
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);
        List<LocalDate> datas = validarDatasEscolhidas(request.datasUtilizacao());

        for (LocalDate data : datas) {
            validarDia("CRECHE", data, pets);
        }

        List<SaldoSemanalResponse> saldos = new ArrayList<>();
        for (PetsEntity pet : pets) {
            saldos.addAll(validarSaldoSemanal(pet, datas));
        }

        boolean aguardandoAprovacao = false;

        for (PetsEntity pet : pets) {
            for (LocalDate data : datas) {
                AgendamentosEntity agendamento = paraEntityAgendamentos(pet, data, "CRECHE");
                agendamentosRepository.save(agendamento);
            }
            ContratosEntity plano = buscarPlanoVigente(pet, datas.getFirst());
            if ("PENDENTE".equals(plano.getSituacao())) {
                aguardandoAprovacao = true;
            }
        }

        return new AgendamentoPlanoResponse(
                pets.stream().map(PetsEntity::getNome).toList(),
                datas,
                saldos,
                aguardandoAprovacao
        );
    }

    @Transactional
    public CancelamentoResponse cancelarAgendamento(Long idAgendamento, Long idUsuario) {
        AgendamentosEntity agendamento = buscarAgendamentoDoTutor(idAgendamento, idUsuario);
        PetsEntity pet = agendamento.getFkPet();
        LocalDate data = agendamento.getDataEntrada().toLocalDate();
        String categoria = agendamento.getServico();

        if (data.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível cancelar datas passadas.");
        }
        if (agendamento.getSituacao() != SituacaoAgendamento.AGENDADO
                && agendamento.getSituacao() != SituacaoAgendamento.CONFIRMADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este agendamento não pode ser cancelado.");
        }

        Optional<ContratosEntity> contrato = contratosRepository.buscarContratoDoDia(pet.getIdPet(), categoria, data);

        if (contrato.isEmpty()) {
            agendamento.setSituacao(SituacaoAgendamento.CANCELADO);
            agendamentosRepository.save(agendamento);
            return new CancelamentoResponse("Dia cancelado. O uso foi devolvido ao saldo do plano.");
        }

        cancelarContratoAgendado(contrato.get(), pet, categoria);
        return new CancelamentoResponse("Agendamento cancelado.");
    }

    private AgendamentosEntity buscarAgendamentoDoTutor(Long idAgendamento, Long idUsuario) {
        AgendamentosEntity agendamento = agendamentosRepository.findById(idAgendamento)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));

        if (!agendamento.getFkPet().getFkUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Agendamento não pertence a este tutor");
        }
        return agendamento;
    }

    private void cancelarContratoAgendado(ContratosEntity contrato, PetsEntity pet, String categoria) {
        List<AgendamentosEntity> dias = agendamentosRepository.buscarAtivosNoPerido(
                pet.getIdPet(), categoria,
                contrato.getDataInicio().atStartOfDay(),
                contrato.getDataFim().plusDays(1).atStartOfDay());

        for (AgendamentosEntity dia : dias) {
            dia.setSituacao(SituacaoAgendamento.CANCELADO);
            agendamentosRepository.save(dia);
        }

        contrato.setSituacao("CANCELADO");
        contratosRepository.save(contrato);

        movimentacoesRepository.findByContrato(contrato)
                .filter(m -> "PENDENTE".equals(m.getSituacao()))
                .ifPresent(m -> {
                    m.setSituacao("CANCELADO");
                    movimentacoesRepository.save(m);
                });
    }


    private AgendamentoCriadoResponse agendarPorDia(ServicosEntity servico, OrcamentoRequest request, Long idUsuario) {
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);
        List<LocalDate> datas = definirDatasEscolhidas(servico, request);
        String servicoCategoria = servico.getCategoria();

        for (LocalDate data : datas) {
            validarDia(servicoCategoria, data, pets);
        }

        boolean tutorAprovado = contratosRepository.existsByPetFkUsuarioIdUsuarioAndSituacaoIn(idUsuario, List.of("ATIVO", "ENCERRADO"));
        String situacaoContrato = tutorAprovado ? "ATIVO" : "PENDENTE";
        BigDecimal valorPorPet = calcularValorTotal(servico, datas, 1);

        for (PetsEntity pet : pets) {
            ContratosEntity contrato = salvarContrato(pet, servico, datas, valorPorPet, situacaoContrato);
            salvarMovimentacao(contrato, valorPorPet);

            for (LocalDate data : datas) {
                AgendamentosEntity agendamento = paraEntityAgendamentos(pet, data, servicoCategoria);
                agendamentosRepository.save(agendamento);
            }
        }

        BigDecimal total = valorPorPet.multiply(BigDecimal.valueOf(pets.size()));
        return new AgendamentoCriadoResponse(
                total,
                !tutorAprovado
        );
    }

    private AgendamentoCriadoResponse contratarPlano(ServicosEntity servico, OrcamentoRequest request, Long idUsuario) {
        List<PetsEntity> pets = buscarPetsEscolhidos(request.idsPet(), idUsuario);
        LocalDate inicio = validarDataInicioPlano(request.dataInicioPlano());
        LocalDate fim = inicio.plusMonths(1).minusDays(1);

        for (PetsEntity pet : pets) {
            if (contratosRepository.existePlanoSobreposto(pet.getIdPet(), inicio, fim)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, pet.getNome() + " já possui um plano nesse período");
            }
        }

        boolean tutorAprovado = contratosRepository.existsByPetFkUsuarioIdUsuarioAndSituacaoIn(idUsuario, List.of("ATIVO", "ENCERRADO"));
        String situacao =  tutorAprovado ? "ATIVO" : "PENDENTE";
        BigDecimal valorPorPet = calcularValorTotal(servico, List.of(inicio), 1);

        for (PetsEntity pet : pets) {
            ContratosEntity contrato = salvarContrato(pet, servico, List.of(inicio, fim), valorPorPet, situacao);
            salvarMovimentacao(contrato, valorPorPet);
        }
        return new AgendamentoCriadoResponse(
                valorPorPet.multiply(BigDecimal.valueOf(pets.size())),
                !tutorAprovado
        );
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

        return agendamentosRepository.buscarAgendamentoPorServico(servico, inicioHora, fimHora).stream()
                .collect(Collectors.toMap(
                        DiasComAgendamentoResponse::data,
                        DiasComAgendamentoResponse::totalPetsAgendados
                ));
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

    private List<PetsEntity> buscarPetsEscolhidos(List<Long> ids, Long idUsuario) {
        if (ids == null || ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione ao menos um pet");
        }

        List<Long> idsDistintos = ids.stream().distinct().toList();
        List<PetsEntity> pets = petsRepository.findByIdPetInAndFkUsuarioIdUsuario(idsDistintos, idUsuario);

        if (pets.size() != idsDistintos.size()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pet não encontrado para este tutor");
        }

        return pets;
    }

    private List<LocalDate> definirDatasEscolhidas(ServicosEntity servico, OrcamentoRequest request) {
        if ("PLANO".equals(servico.getModalidade())) {
            return List.of(validarDataInicioPlano(request.dataInicioPlano()));
        }
        return validarDatasEscolhidas(request.datasUtilizacao());
    }

    private BigDecimal calcularValorTotal(ServicosEntity servico, List<LocalDate> datas, Integer quantidadePets) {
        int quantidadeDias = "PLANO".equals(servico.getModalidade()) ? 1 : datas.size();

        return servico.getValor()
                .multiply(BigDecimal.valueOf(quantidadeDias))
                .multiply(BigDecimal.valueOf(quantidadePets))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private ContratosEntity buscarPlanoVigente(PetsEntity pet, LocalDate data) {
        return contratosRepository.buscarPlanoVigente(pet.getIdPet(), data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        pet.getNome() + " não possui plano vigente em " + data + "."));
    }

    private String formatar(String servico) {
        return servico == null ? null : servico.trim().toUpperCase();
    }

    private ContratosEntity salvarContrato(PetsEntity pet, ServicosEntity servico, List<LocalDate> datas, BigDecimal valor, String situacao) {
        ContratosEntity contrato = new ContratosEntity();
        contrato.setPet(pet);
        contrato.setServicos(servico);
        contrato.setDataInicio(datas.getFirst());
        contrato.setDataFim(datas.getLast());
        contrato.setValor(valor);
        contrato.setSituacao(situacao);
        return contratosRepository.save(contrato);
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
                pet.getNome()
        );
    }

    private AgendamentosEntity paraEntityAgendamentos(PetsEntity pet, LocalDate data, String servico) {
        AgendamentosEntity agendamento = new AgendamentosEntity();
        agendamento.setFkPet(pet);
        agendamento.setFkCalendario(buscarOuCriarCalendario(data));
        agendamento.setDataEntrada(data.atStartOfDay());
        agendamento.setServico(servico);
        agendamento.setSituacao(SituacaoAgendamento.AGENDADO);
        return agendamento;
    }

    private void validarServico(String servico) {
        if (servico == null || servico.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um serviço.");
        }
        if (!List.of("CRECHE", "DAYUSE", "HOTEL").contains(servico)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido.");
        }
    }

    private void validarDia(String servico, LocalDate data, List<PetsEntity> pets) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.plusDays(1).atStartOfDay();

        CalendarioEntity calendario = calendarioRepository.findByData(data).orElse(null);
        long ocupadas =agendamentosRepository.buscarAgendamentoPorServico(servico, inicio, fim)
                .stream().mapToLong(DiasComAgendamentoResponse::totalPetsAgendados).sum();

        long livres = capacidadeDoDia(servico, calendario) - ocupadas;

        if (livres < pets.size()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sem vagas suficientes em " + data + ".");
        }

        for (PetsEntity pet : pets) {
            if (agendamentosRepository.petJaAgendado(pet.getIdPet(), inicio, fim)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, pet.getNome() + " já possui agendamento em " + data + ".");
            }
        }
    }

    private List<LocalDate> validarDatasEscolhidas(List<LocalDate> datas) {
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

    private List<SaldoSemanalResponse> validarSaldoSemanal(PetsEntity pet, List<LocalDate> datas) {
        Map<LocalDate, List<LocalDate>> datasPorSemana = datas.stream()
                .collect(Collectors.groupingBy(data -> data.with(DayOfWeek.MONDAY)));

        List<SaldoSemanalResponse> saldos = new ArrayList<>();

        for (Map.Entry<LocalDate, List<LocalDate>> semana : datasPorSemana.entrySet()) {
            LocalDate segunda = semana.getKey();
            List<LocalDate> diasNovos = semana.getValue();

            ContratosEntity plano = null;
            for (LocalDate data : datas) {
                plano = buscarPlanoVigente(pet, data);
            }

            int limite = Integer.parseInt(plano.getServicos().getFrequencia().replaceAll("[^0-9]", ""));
            long usados = agendamentosRepository.contarCrecheNaSemana(
                    pet.getIdPet(), segunda.atStartOfDay(), segunda.plusDays(7).atStartOfDay());

            if (usados + diasNovos.size() > limite) {
                long restantes = Math.max(0, limite - usados);
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        pet.getNome() + " tem " + restantes + "usos(s) do plano na semana de " + segunda + ". Para um dia extra, contrate a creche diária.");
            }

            long usadosDepois = usados + diasNovos.size();
            saldos.add(new SaldoSemanalResponse(pet.getNome(), segunda, limite, usadosDepois, limite - usadosDepois));
        }
        return saldos;
    }

    private ServicosEntity buscarServicoEscolhido(Integer idServico) {
        if (idServico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um serviço válido");
        }
        return servicosRepository.findById(idServico).filter(s -> Boolean.TRUE.equals(s.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado ou inativo"));
    }
}