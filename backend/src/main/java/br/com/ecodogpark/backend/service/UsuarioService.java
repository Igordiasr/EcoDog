package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.FuncionarioResponse;
import br.com.ecodogpark.backend.dto.UsuarioDTO.*;
import br.com.ecodogpark.backend.entity.ContratoDiasSemanaEntity;
import br.com.ecodogpark.backend.entity.ContratosEntity;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.DiaSemana;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.DadoJaCadastradoException;
import br.com.ecodogpark.backend.repository.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final ContratoRepository contratoRepository;
    private final ContratoDiasSemanaRepository contratoDiasSemanaRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          ContratoRepository contratoRepository,
                          ContratoDiasSemanaRepository contratoDiasSemanaRepository,
                          AgendamentoRepository agendamentoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.contratoRepository = contratoRepository;
        this.contratoDiasSemanaRepository = contratoDiasSemanaRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ClienteResponse> buscarClientes() {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        List<ContratosEntity> contratos = contratoRepository.buscarContratosParaListaClientes(hoje);
        if (contratos.isEmpty()) {
            return List.of();
        }

        List<Long> idsContratos = contratos.stream()
                .map(ContratosEntity::getIdContrato).toList();

        List<ContratoDiasSemanaEntity> diasContratados =
                contratoDiasSemanaRepository.findByContrato_idContratoIn(idsContratos);
        Map<Long, List<DiaSemana>> diasPorContrato = diasContratados.stream()
                .collect(Collectors.groupingBy(
                        dia -> dia.getContrato().getIdContrato(),
                        Collectors.mapping(ContratoDiasSemanaEntity::getDiaSemana, Collectors.toList())
                ));

        List<QuantidadeDiariasProjection> quantidades = agendamentoRepository.contarDiariasPorContrato(idsContratos);
        Map<Long, Integer> quantidadePorContrato = quantidades.stream()
                .collect(Collectors.toMap(
                        QuantidadeDiariasProjection::getIdContrato,
                        projection -> projection.getQuantidade().intValue()
                ));

        return contratos.stream().map(contrato -> {
            Long idContrato = contrato.getIdContrato();
            String categoria = contrato.getServicos().getCategoria();
            Integer quantidadeDiarias = null;
            List<DiaSemana> diasDaSemana = null;
            if ("HOTEL".equals(categoria) || "DAYUSE".equals(categoria)) {
                quantidadeDiarias = quantidadePorContrato.getOrDefault(idContrato, 0);
            } else if ("CRECHE".equals(categoria)) {
                diasDaSemana = diasPorContrato.getOrDefault(idContrato, List.of());
            }
            return new ClienteResponse(
                    contrato.getPet().getFkUsuario().getIdUsuario(),
                    contrato.getPet().getFkUsuario().getNome(),
                    contrato.getPet().getIdPet(),
                    contrato.getPet().getNome(),
                    idContrato,
                    contrato.getServicos().getIdServico(),
                    categoria,
                    contrato.getValor(),
                    "ATIVO".equals(contrato.getSituacao()),
                    quantidadeDiarias,
                    diasDaSemana
            );
        }).toList();
    }

    public UsuarioResponse buscarTutorPorId(UUID id) {
        return paraUsuarioResponse(buscarTutor(id));
    }

    public void excluirTutor(UUID id) {
        UsuariosEntity tutor = buscarTutor(id);
        tutor.setStatusUsuario(false);
        usuarioRepository.save(tutor);

        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarTutor(UUID id) {
        return usuarioRepository.findById(id)
                .filter(usuario -> "TUTOR".equals(usuario.getTipo().name()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado"));
    }

    private void preencher(UsuariosEntity usuario, UsuarioRequest usuarioRequest) {
        usuario.setNome(usuarioRequest.nome());
        usuario.setEmail(usuarioRequest.email());
        usuario.setCpf(usuarioRequest.cpf());
        usuario.setTelefone(usuarioRequest.telefone().trim());
        usuario.setSenha(passwordEncoder.encode(usuarioRequest.senha()));
        usuario.setTipo(TipoUsuario.TUTOR);
    }

    private UsuarioResponse paraUsuarioResponse(UsuariosEntity usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone());
    }

    // -------------------------- Regras de negócio para Gestão de Usuários --------------------------------------

    public List<FuncionarioResponse> listarMonitores() {
        return usuarioRepository.findByTipo(TipoUsuario.MONITOR)
                .stream()
                .map(this::paraFuncionarioResponse)
                .toList();
    }

    public FuncionarioResponse cadastrarMonitor(MonitorRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new DadoJaCadastradoException("Email já cadastrado");
        }
        if (usuarioRepository.existsByCpf(request.cpf())) {
            throw new DadoJaCadastradoException("CPF já cadastrado");
        }
        UsuariosEntity usuario = new UsuariosEntity();
        usuario.setStatusUsuario(true);
        paraUsuarioEntity(usuario, request);
        return paraFuncionarioResponse(usuarioRepository.save(usuario));
    }

    public FuncionarioResponse buscarMonitorPorId(UUID id) {
        UsuariosEntity monitor = buscarPorTipo(id, TipoUsuario.MONITOR, "Monitor não encontrado");
        return paraFuncionarioResponse(monitor);
    }

    public FuncionarioResponse atualizarMonitor(UUID id, MonitorRequest request) {
        UsuariosEntity monitorParaAtualizar = buscarPorTipo(id, TipoUsuario.MONITOR, "Monitor não encontrado");

        if (usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        if (usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        paraUsuarioEntity(monitorParaAtualizar, request);
        return paraFuncionarioResponse(usuarioRepository.save(monitorParaAtualizar));
    }

    public void excluirMonitor(UUID id) {
        UsuariosEntity monitor = buscarPorTipo(id, TipoUsuario.MONITOR, "Monitor não encontrado");

        monitor.setStatusUsuario(false);
        usuarioRepository.save(monitor);

        usuarioRepository.deleteById(id);
    }

    // -------------------------- Regras de negócio para Gestão de Administradores -------------------------------

    public List<FuncionarioResponse> listarAdministradores() {
        return usuarioRepository.findByTipo(TipoUsuario.ADMINISTRADOR).stream().map(this::paraFuncionarioResponse).toList();
    }

    public FuncionarioResponse cadastrarAdministrador(UsuarioRequest request) {
        validarEmailECpfDisponiveis(request.email(), request.cpf(), null);
        UsuariosEntity administrador = new UsuariosEntity();
        administrador.setStatusUsuario(true);
        preencherUsuarioAdministrativo(administrador, request);
        return paraFuncionarioResponse(usuarioRepository.save(administrador));
    }

    public FuncionarioResponse buscarAdministradorPorId(UUID id) {
        return paraFuncionarioResponse(buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado"));
    }

    public FuncionarioResponse atualizarAdministrador(UUID id, UsuarioRequest request) {
        UsuariosEntity administrador = buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado");
        validarEmailECpfDisponiveis(request.email(), request.cpf(), id);
        preencherUsuarioAdministrativo(administrador, request);
        return paraFuncionarioResponse(usuarioRepository.save(administrador));
    }

    public void excluirAdministrador(UUID id) {
        UsuariosEntity administrador = buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado");

        administrador.setStatusUsuario(false);
        usuarioRepository.save(administrador);

        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarPorTipo(UUID id, TipoUsuario tipo, String mensagem) {
        return usuarioRepository.findById(id)
                .filter(usuario -> tipo == usuario.getTipo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, mensagem));
    }

    private void validarEmailECpfDisponiveis(String email, String cpf, UUID idIgnorado) {
        boolean emailEmUso = idIgnorado == null
                ? usuarioRepository.existsByEmail(email)
                : usuarioRepository.existsByEmailAndIdUsuarioNot(email, idIgnorado);
        boolean cpfEmUso = idIgnorado == null
                ? usuarioRepository.existsByCpf(cpf)
                : usuarioRepository.existsByCpfAndIdUsuarioNot(cpf, idIgnorado);
        if (emailEmUso) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        if (cpfEmUso) throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
    }

    private void preencherUsuarioAdministrativo(UsuariosEntity usuario, UsuarioRequest request) {
        usuario.setNome(request.nome());
        usuario.setSobrenome(request.sobrenome());
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setTelefone(request.telefone().trim());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setTipo(TipoUsuario.ADMINISTRADOR);
    }

    private FuncionarioResponse paraFuncionarioResponse(UsuariosEntity usuario) {
        return new FuncionarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getSobrenome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getStatusUsuario(),
                usuario.getDataCadastro()
        );
    }

    private void paraUsuarioEntity(UsuariosEntity usuario, MonitorRequest monitorRequest) {
        usuario.setNome(monitorRequest.nome());
        usuario.setSobrenome(monitorRequest.sobrenome());
        usuario.setEmail(monitorRequest.email());
        usuario.setCpf(monitorRequest.cpf());
        usuario.setTelefone(monitorRequest.telefone().trim());
        usuario.setSenha(passwordEncoder.encode(monitorRequest.senha()));
        usuario.setTipo(TipoUsuario.MONITOR);
    }
}
