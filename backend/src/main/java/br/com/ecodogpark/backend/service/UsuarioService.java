package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.config.TokenConfig;
import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.MonitorResponse;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.LoginResponse;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioResponse;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.CredenciaisIncorretasException;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenConfig tokenConfig;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, TokenConfig tokenConfig) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
    }

    public LoginResponse entrar(LoginRequest dadosLogin) {
        UsernamePasswordAuthenticationToken usuarioESenha = new UsernamePasswordAuthenticationToken(dadosLogin.email(), dadosLogin.senha());
        Authentication authentication = authenticationManager.authenticate(usuarioESenha);
        UsuariosEntity usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new CredenciaisIncorretasException("Email ou senha inválidos"));
        return new LoginResponse(tokenConfig.gerarToken(usuario));
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
        return usuarioRepository.findByTipo(TipoUsuario.TUTOR).stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse buscarTutorPorId(UUID id) {
        return paraUsuarioResponse(buscarTutor(id));
    }

    public UsuarioResponse atualizarTutor(UUID id, UsuarioRequest usuarioRequest) {
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

    public List<MonitorResponse> listarMonitores() {
        return usuarioRepository.findByTipo(TipoUsuario.MONITOR)
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

    public MonitorResponse buscarMonitorPorId(UUID id) {
        UsuariosEntity monitor = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo().name()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado"));
        return paraMonitorResponse(monitor);
    }

    public MonitorResponse atualizarMonitor(UUID id, MonitorRequest request) {
        UsuariosEntity monitorParaAtualizar = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo().name()))
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

    public void excluirMonitor(UUID id) {
        UsuariosEntity monitor = usuarioRepository.findById(id)
                .filter(usuario -> "MONITOR".equals(usuario.getTipo().name()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado"));

        monitor.setStatusUsuario(false);
        usuarioRepository.save(monitor);

        usuarioRepository.deleteById(id);
    }

    // -------------------------- Regras de negócio para Gestão de Administradores -------------------------------

    public List<UsuarioResponse> listarAdministradores() {
        return usuarioRepository.findByTipo(TipoUsuario.ADMINISTRADOR).stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse cadastrarAdministrador(UsuarioRequest request) {
        validarEmailECpfDisponiveis(request.email(), request.cpf(), null);
        UsuariosEntity administrador = new UsuariosEntity();
        administrador.setStatusUsuario(true);
        preencherUsuarioAdministrativo(administrador, request);
        return paraUsuarioResponse(usuarioRepository.save(administrador));
    }

    public UsuarioResponse buscarAdministradorPorId(UUID id) {
        return paraUsuarioResponse(buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado"));
    }

    public UsuarioResponse atualizarAdministrador(UUID id, UsuarioRequest request) {
        UsuariosEntity administrador = buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado");
        validarEmailECpfDisponiveis(request.email(), request.cpf(), id);
        preencherUsuarioAdministrativo(administrador, request);
        return paraUsuarioResponse(usuarioRepository.save(administrador));
    }

    public void excluirAdministrador(UUID id) {
        UsuariosEntity administrador = buscarPorTipo(id, TipoUsuario.ADMINISTRADOR, "Administrador não encontrado");

        administrador.setStatusUsuario(false);
        usuarioRepository.save(administrador);

        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarPorTipo(UUID id, TipoUsuario tipo, String mensagem) {
        return usuarioRepository.findById(id)
                .filter(usuario -> tipo.equals(usuario.getTipo().name()))
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
        usuario.setEmail(request.email());
        usuario.setCpf(request.cpf());
        usuario.setTelefone(request.telefone().trim());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setTipo(TipoUsuario.ADMINISTRADOR);
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
        usuario.setSenha(passwordEncoder.encode(monitorRequest.senha()));
        usuario.setTipo(TipoUsuario.MONITOR);
    }
}
