package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarValorContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.VincularPlanoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.DiaSemana;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.*;
import br.com.ecodogpark.backend.mapper.GerenciamentoClienteMapper;
import br.com.ecodogpark.backend.mapper.PetMapper;
import br.com.ecodogpark.backend.mapper.TutorMapper;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GerenciamentoClienteService {

    private final ContratoRepository contratoRepository;
    private final ContratoDiasSemanaRepository contratoDiasSemanaRepository;
    private final ServicosRepository servicosRepository;
    private final UsuarioRepository usuarioRepository;
    private final PetRepository petRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final MovimentacoesRepository movimentacoesRepository;
    private final CalendarioRepository calendarioRepository;

    public GerenciamentoClienteService(
            ContratoRepository contratoRepository,
            ContratoDiasSemanaRepository contratoDiasSemanaRepository,
            ServicosRepository servicosRepository,
            UsuarioRepository usuarioRepository,
            PetRepository petRepository,
            AgendamentoRepository agendamentoRepository,
            MovimentacoesRepository movimentacoesRepository,
            CalendarioRepository calendarioRepository
    ) {
        this.contratoRepository = contratoRepository;
        this.contratoDiasSemanaRepository = contratoDiasSemanaRepository;
        this.servicosRepository = servicosRepository;
        this.usuarioRepository = usuarioRepository;
        this.petRepository = petRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.movimentacoesRepository = movimentacoesRepository;
        this.calendarioRepository = calendarioRepository;
    }

    @Transactional(readOnly = true)
    public List<PetGerenciamentoResponse> buscarContratos(String pesquisa) {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        List<PetsEntity> pets = petRepository.buscarPetsParaGerenciamento(pesquisa, TipoUsuario.TUTOR);

        if (pets.isEmpty()) {
            return List.of();
        }
        List<UUID> idsPets = pets.stream().map(PetsEntity::getIdPet).toList();
        List<ContratosEntity> contratos = contratoRepository.buscarContratosDosPetsParaGerenciamento(idsPets, hoje);
        List<Long> idsContratos = contratos.stream().map(ContratosEntity::getIdContrato).toList();

        List<ContratoDiasSemanaEntity> diasContratados = idsContratos.isEmpty()
                ? List.of()
                : contratoDiasSemanaRepository.findByContrato_idContratoIn(idsContratos);

        Map<Long, List<String>> diasPorContrato = diasContratados.stream()
                .collect(Collectors.groupingBy(
                        dia -> dia.getContrato().getIdContrato(),
                        Collectors.mapping(
                                dia -> dia.getDiaSemana().name(),
                                Collectors.toList()
                        )
                ));

        List<QuantidadeDiariasProjection> quantidades = idsContratos.isEmpty()
                ? List.of()
                : agendamentoRepository.contarDiariasPorContrato(idsContratos);

        Map<Long, Long> quantidadePorContrato = quantidades.stream()
                .collect(Collectors.toMap(
                        QuantidadeDiariasProjection::getIdContrato,
                        QuantidadeDiariasProjection::getQuantidade
                ));

        Map<UUID, List<ContratosEntity>> contratosPorPet = contratos.stream()
                .collect(Collectors.groupingBy(
                        contrato -> contrato.getPet().getIdPet()
                ));

        return pets.stream()
                .map(pet -> {
                    List<ContratosEntity> contratosDoPet = contratosPorPet
                       .getOrDefault(pet.getIdPet(), List.of());

                    List<ContratoGerenciamentoResponse> listaContratos = contratosDoPet.stream()
                            .map(contrato -> {
                                Long idContrato = contrato.getIdContrato();
                                String categoria = contrato.getServicos().getCategoria();
                                Long quantidadeDiarias = null;
                                List<String> diasSemana = null;

                                if ("HOTEL".equals(categoria) || "DAYUSE".equals(categoria)) {
                                    quantidadeDiarias = quantidadePorContrato.getOrDefault(idContrato, 0L);
                                } else if ("CRECHE".equals(categoria)) {
                                    diasSemana = diasPorContrato.getOrDefault(idContrato, List.of());
                                }

                                return GerenciamentoClienteMapper.entityParaContratoResponse(
                                        contrato,
                                        quantidadeDiarias,
                                        diasSemana
                                );
                            }).toList();

                    return PetMapper.entityParaGerenciamentoResponse(
                            pet,
                            listaContratos
                    );
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<PlanoDisponivelResponse> listarPlanos() {
        return servicosRepository.findByStatusTrueOrderByNomeAsc()
                .stream()
                .map(GerenciamentoClienteMapper::entityParaPlanoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TutorDisponivelResponse> listarTutores() {
        return usuarioRepository.findByTipoAndStatusUsuarioTrue(TipoUsuario.TUTOR)
                .stream()
                .map(TutorMapper::entityParaTutorDisponivelResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VincularPetResponse> listarPetsDoTutor(UUID idTutor) {
        return petRepository.findByFkUsuarioIdUsuario(idTutor)
                .stream()
                .map(PetMapper::entityParaVincularResponse)
                .toList();
    }

    @Transactional
    public void atualizarContrato(Long idContrato, AtualizarValorContratoRequest request) {
        ContratosEntity contrato = contratoRepository.findById(idContrato)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado"));

        MovimentacoesEntity movimentacao = movimentacoesRepository.findByContrato(contrato)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movimentação não encontrada."));

        contrato.setValor(request.valor());
        contratoRepository.save(contrato);

        movimentacao.setValor(request.valor());
        movimentacoesRepository.save(movimentacao);

    }

    @Transactional
    public void alterarStatusContrato(Long idContrato, AlterarStatusContratoRequest request) {
        ContratosEntity contrato = contratoRepository.findById(idContrato)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado"));

        contrato.setSituacao(request.situacao());
        contratoRepository.save(contrato);
    }

    @Transactional
    public VincularPlanoResponse vincularPlano(VincularPlanoRequest request) {
        UsuariosEntity tutor = usuarioRepository.findById(request.idTutor())
                .orElseThrow(() -> new TutorNaoEncontradoException("Tutor não encontrado"));

        PetsEntity pet = petRepository.findById(request.idPet())
                .orElseThrow(() -> new PetNaoEncontradoException("Pet não encontrado"));

        if (!pet.getFkUsuario().getIdUsuario().equals(tutor.getIdUsuario())) {
            throw new PetNaoPertenceAoTutorException("O pet informado não pertence ao tutor selecionado");
        }

        ServicosEntity servico = servicosRepository.findById(request.idServico())
                .orElseThrow(() -> new ServicoNaoEncontradoException("Serviço não encontrado"));
        if (!servico.getStatus()) {
            throw new ServicoInvalidoException("Serviço inválido");
        }

        if (request.dataInicio() == null) {
            throw new DataInvalidaException("A data de início é obrigatória");
        }
        if (request.dataFim() != null && request.dataFim().isBefore(request.dataInicio())) {
            throw new DataInvalidaException("A data de fim não pode ser anterior à data de início");
        }

        validarDiasSemana(servico, request.diasSemana());

        ContratosEntity contrato = new ContratosEntity();
        contrato.setPet(pet);
        contrato.setServicos(servico);
        contrato.setDataInicio(request.dataInicio());
        contrato.setDataFim(request.dataFim());
        contrato.setValor(request.valor());
        contrato.setSituacao("ATIVO");

        contrato = contratoRepository.save(contrato);

        if ("CRECHE".equals(servico.getCategoria())) {
            salvarDiasDaSemana(contrato, request.diasSemana());
            gerarAgendamentosCreche(contrato, request.diasSemana());
        } else {
            gerarMovimentacoes(contrato);
        }

        return GerenciamentoClienteMapper.entityParaVincularPlanoResponse(contrato);
    }

    private void validarDiasSemana(ServicosEntity servico, List<DiaSemana> diaSemanas) {
        if ("CRECHE".equals(servico.getCategoria())) {
            int frequencia = Integer.parseInt(servico.getFrequencia());

            if (diaSemanas == null || diaSemanas.isEmpty()) {
                throw new DiasSelecionadosInvalidosException("Selecione os dias da semana");
            }
            if (diaSemanas.size() != frequencia) {
                throw new DiasSelecionadosInvalidosException("A quantidade de dias selecionados não corresponde à frequência do plano");
            }
            if (diaSemanas.stream().distinct().count() != diaSemanas.size()) {
                throw new DiasSelecionadosInvalidosException("Existem dias da semana duplicados");
            }
        } else if (diaSemanas != null && !diaSemanas.isEmpty()) {
            throw new DiasSelecionadosInvalidosException("Dias da semana são permitidos somente para creche");
        }
    }

    private void salvarDiasDaSemana(ContratosEntity contrato, List<DiaSemana> diaSemanas) {
        List<ContratoDiasSemanaEntity> dias = diaSemanas.stream()
                .map(dia -> {
                    ContratoDiasSemanaEntity entity = new ContratoDiasSemanaEntity();
                    entity.setContrato(contrato);
                    entity.setDiaSemana(dia);
                    return entity;
                }).toList();

        contratoDiasSemanaRepository.saveAll(dias);
    }

    private void gerarMovimentacoes(ContratosEntity contrato) {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

        MovimentacoesEntity movimentacao = new MovimentacoesEntity();
        movimentacao.setValor(contrato.getValor());
        movimentacao.setDataRegistro(hoje);
        movimentacao.setSituacao("PENDENTE");
        movimentacao.setContrato(contrato);

        movimentacoesRepository.save(movimentacao);
    }

    private void gerarAgendamentosCreche(ContratosEntity contrato, List<DiaSemana> diaSemanas) {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalDate dataInicio = contrato.getDataInicio().isAfter(hoje)
                ? contrato.getDataInicio()
                : hoje;

        LocalDate dataFim = hoje.plusDays(30);
        Set<DiaSemana> diasContratados = new HashSet<>(diaSemanas);
        List<AgendamentosEntity> agendamentos = new ArrayList<>();

        while (!dataInicio.isAfter(dataFim)) {
            if (dataInicio.getDayOfWeek().getValue() <= 5) {
                DiaSemana diaAtual = converterDiaSemana(dataInicio.getDayOfWeek());

                if (diasContratados.contains(diaAtual)) {
                    CalendarioEntity  calendario = calendarioRepository.findByData(dataInicio)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não existe calendario para " + diaAtual));

                    AgendamentosEntity agendamento = new AgendamentosEntity();
                    agendamento.setFkPet(contrato.getPet());
                    agendamento.setFkCalendario(calendario);
                    agendamento.setDataEntrada(dataInicio.atStartOfDay());
                    agendamento.setDataSaida(null);
                    agendamento.setServico("CRECHE");
                    agendamento.setSituacao(SituacaoAgendamento.AGENDADO);

                    agendamentos.add(agendamento);
                }
            }
            dataInicio = dataInicio.plusDays(1);
        }
        if (!agendamentos.isEmpty()) {
            agendamentoRepository.saveAll(agendamentos);
        }
    }

    private DiaSemana converterDiaSemana(DayOfWeek dia) {
        return switch (dia) {
            case MONDAY -> DiaSemana.SEGUNDA;
            case TUESDAY -> DiaSemana.TERCA;
            case WEDNESDAY -> DiaSemana.QUARTA;
            case THURSDAY -> DiaSemana.QUINTA;
            case FRIDAY -> DiaSemana.SEXTA;

            default -> throw new IllegalArgumentException("Dia da semana não permitido na creche");
        };
    }
}