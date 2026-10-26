package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.MonitorResponse;
import br.com.ecodogpark.backend.dto.UsuarioRequest;
import br.com.ecodogpark.backend.dto.UsuarioResponse;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.repository.PetRepository;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PetRepository petRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, PetRepository petRepository) {
        this.usuarioRepository = usuarioRepository;
        this.petRepository = petRepository;
    }

    public UsuarioResponse cadastrarTutor(UsuarioRequest usuarioRequest) {
        if (usuarioRepository.existsByEmail(usuarioRequest.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (usuarioRepository.existsByCpf(usuarioRequest.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        UsuariosEntity usuario = new UsuariosEntity();
        usuario.setStatusUsuario(true);
        preencher(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listarTutores() {
        return usuarioRepository.findByTipo("TUTOR").stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse buscarTutorPorId(Long id) {
        return paraUsuarioResponse(buscarTutor(id));
    }

    public UsuarioResponse atualizarTutor(Long id, UsuarioRequest usuarioRequest) {
        if (usuarioRepository.existsByEmailAndIdUsuarioNot(usuarioRequest.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        if (usuarioRepository.existsByCpfAndIdUsuarioNot(usuarioRequest.cpf(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        UsuariosEntity usuario = buscarTutor(id);
        preencher(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public void excluirTutor(Long id) {
        UsuariosEntity tutor = buscarTutor(id);
        tutor.setStatusUsuario(false);
        usuarioRepository.save(tutor);

        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarTutor(Long id) {
        return usuarioRepository.findById(id)
                .filter(usuario -> "TUTOR".equals(usuario.getTipo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tutor não encontrado"));
    }

    private void preencher(UsuariosEntity usuario, UsuarioRequest usuarioRequest) {
        usuario.setNome(usuarioRequest.nome());
        usuario.setEmail(usuarioRequest.email());
        usuario.setCpf(usuarioRequest.cpf());
        usuario.setTelefone(usuarioRequest.telefone().trim());
        usuario.setSenha(usuarioRequest.senha());
        usuario.setTipo("TUTOR");
    }

    private UsuarioResponse paraUsuarioResponse(UsuariosEntity usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone());
    }

    // -------------------------- Regras de negócio para Gestão de Usuários --------------------------------------

    public List<MonitorResponse> listarMonitores() {
        return usuarioRepository.findByTipo("MONITOR")
                .stream()
                .map(this::paraMonitorResponse)
                .toList();
    }

    public MonitorResponse cadastrarMonitor(MonitorRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        if (usuarioRepository.existsByCpf(request.cpf())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        UsuariosEntity usuario = new UsuariosEntity();
        usuario.setStatusUsuario(true);
        paraUsuarioEntity(usuario, request);
        return paraMonitorResponse(usuarioRepository.save(usuario));
    }

    public MonitorResponse buscarMonitorPorId(Long id) {
        UsuariosEntity monitor = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado"));
        return paraMonitorResponse(monitor);
    }

    public MonitorResponse atualizarMonitor(Long id, MonitorRequest request) {
        UsuariosEntity monitorParaAtualizar = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado"));
        if (usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        }
        if (usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        paraUsuarioEntity(monitorParaAtualizar, request);
        return paraMonitorResponse(usuarioRepository.save(monitorParaAtualizar));
    }

    public void excluirMonitor(Long id) {
        UsuariosEntity monitor = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado"));

        monitor.setStatusUsuario(false);
        usuarioRepository.save(monitor);

        usuarioRepository.deleteById(id);
    }

    // -------------------------- Regras de negócio para Gestão de Administradores -------------------------------

    public List<UsuarioResponse> listarAdministradores() {
        return usuarioRepository.findByTipo("ADMINISTRADOR").stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse cadastrarAdministrador(UsuarioRequest request) {
        validarEmailECpfDisponiveis(request.email(), request.cpf(), null);
        UsuariosEntity administrador = new UsuariosEntity();
        administrador.setStatusUsuario(true);
        preencherUsuarioAdministrativo(administrador, request, "ADMINISTRADOR");
        return paraUsuarioResponse(usuarioRepository.save(administrador));
    }

    public UsuarioResponse buscarAdministradorPorId(Long id) {
        return paraUsuarioResponse(buscarPorTipo(id, "ADMINISTRADOR", "Administrador não encontrado"));
    }

    public UsuarioResponse atualizarAdministrador(Long id, UsuarioRequest request) {
        UsuariosEntity administrador = buscarPorTipo(id, "ADMINISTRADOR", "Administrador não encontrado");
        validarEmailECpfDisponiveis(request.email(), request.cpf(), id);
        preencherUsuarioAdministrativo(administrador, request, "ADMINISTRADOR");
        return paraUsuarioResponse(usuarioRepository.save(administrador));
    }

    public void excluirAdministrador(Long id) {
        UsuariosEntity administrador = buscarPorTipo(id, "ADMINISTRADOR", "Administrador não encontrado");

        administrador.setStatusUsuario(false);
        usuarioRepository.save(administrador);

        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarPorTipo(Long id, String tipo, String mensagem) {
        return usuarioRepository.findById(id)
                .filter(usuario -> tipo.equals(usuario.getTipo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, mensagem));
    }

    private void validarEmailECpfDisponiveis(String email, String cpf, Long idIgnorado) {
        boolean emailEmUso = idIgnorado == null
                ? usuarioRepository.existsByEmail(email)
                : usuarioRepository.existsByEmailAndIdUsuarioNot(email, idIgnorado);
        boolean cpfEmUso = idIgnorado == null
                ? usuarioRepository.existsByCpf(cpf)
                : usuarioRepository.existsByCpfAndIdUsuarioNot(cpf, idIgnorado);
        if (emailEmUso) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
        if (cpfEmUso) throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
    }

    private void preencherUsuarioAdministrativo(UsuariosEntity usuario, UsuarioRequest request, String tipo) {
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setTelefone(request.telefone().trim());
        usuario.setSenha(request.senha());
        usuario.setTipo(tipo);
    }

    private MonitorResponse paraMonitorResponse(UsuariosEntity usuario) {
        return new MonitorResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataCadastro()
        );
    }

    private void paraUsuarioEntity(UsuariosEntity usuario, MonitorRequest monitorRequest) {
        usuario.setNome(monitorRequest.nome());
        usuario.setEmail(monitorRequest.email());
        usuario.setCpf(monitorRequest.cpf());
        usuario.setTelefone(monitorRequest.telefone().trim());
        usuario.setSenha(monitorRequest.senha());
        usuario.setTipo("MONITOR");
    }
}
