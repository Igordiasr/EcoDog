package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarValorContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.mapper.GerenciamentoClienteMapper;
import br.com.ecodogpark.backend.mapper.PetMapper;
import br.com.ecodogpark.backend.mapper.TutorMapper;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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
    private final CalendarioRepository calendarioRepository;

    public GerenciamentoClienteService(
            ContratoRepository contratoRepository,
            ContratoDiasSemanaRepository contratoDiasSemanaRepository,
            ServicosRepository servicosRepository,
            UsuarioRepository usuarioRepository,
            PetRepository petRepository,
            AgendamentoRepository agendamentoRepository,
            CalendarioRepository calendarioRepository
    ) {
        this.contratoRepository = contratoRepository;
        this.contratoDiasSemanaRepository = contratoDiasSemanaRepository;
        this.servicosRepository = servicosRepository;
        this.usuarioRepository = usuarioRepository;
        this.petRepository = petRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.calendarioRepository = calendarioRepository;
    }

    @Transactional(readOnly = true)
    public List<PetGerenciamentoResponse> buscarContratos(String pesquisa) {

        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));

        List<PetsEntity> pets = petRepository.buscarPetsParaGerenciamento(
                pesquisa,
                TipoUsuario.TUTOR
        );

        if (pets.isEmpty()) {
            return List.of();
        }
        List<UUID> idsPets = pets.stream()
                .map(PetsEntity::getIdPet)
                .toList();

        List<ContratosEntity> contratos =
                contratoRepository.buscarContratosDosPetsParaGerenciamento(
                        idsPets,
                        hoje
                );

        List<Long> idsContratos = contratos.stream()
                .map(ContratosEntity::getIdContrato)
                .toList();

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

                    List<ContratosEntity> contratosDoPet =
                            contratosPorPet.getOrDefault(pet.getIdPet(), List.of());

                    List<ContratoGerenciamentoResponse> listaContratos =
                            contratosDoPet.stream()
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
                                    })
                                    .toList();

                    return PetMapper.entityParaGerenciamentoResponse(
                            pet,
                            listaContratos
                    );
                })
                .toList();
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
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contrato não encontrado"
                ));

        contrato.setValor(request.valor());
        contratoRepository.save(contrato);
    }

    @Transactional
    public void alterarStatusContrato(Long idContrato, AlterarStatusContratoRequest request) {

        ContratosEntity contrato = contratoRepository.findById(idContrato)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contrato não encontrado"
                ));

        contrato.setSituacao(request.situacao());
        contratoRepository.save(contrato);
    }

   }