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
        UsuariosEntity usuario = new UsuariosEntity();
        preencherTutor(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listarTutores() {
        return usuarioRepository.findByTipo(TipoUsuario.TUTOR.getValor()).stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse buscarTutorPorId(Long id) {
        return paraUsuarioResponse(buscarTutor(id));
    }

    public UsuarioResponse atualizarTutor(Long id, UsuarioRequest usuarioRequest) {
        if (usuarioRepository.existsByEmailAndIdUsuarioNot(usuarioRequest.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        UsuariosEntity usuario = buscarTutor(id);
        preencherTutor(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public void excluirTutor(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }
//        if (petRepository.existsByTutorId(id)) {
//            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exclua os pets deste usuário antes de removê-lo");
//        }
        usuarioRepository.deleteById(id);
    }

    private UsuariosEntity buscarTutor(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void preencherTutor(UsuariosEntity usuario, UsuarioRequest usuarioRequest) {
        usuario.setNome(usuarioRequest.nome());
        usuario.setEmail(usuarioRequest.email());
        usuario.setCpf(usuarioRequest.cpf());
        usuario.setTelefone(usuarioRequest.telefone().trim());
        usuario.setSenha(usuarioRequest.senha());
        usuario.setTipo(TipoUsuario.TUTOR.getValor());
    }

    private UsuarioResponse paraUsuarioResponse(UsuariosEntity usuario) {
        return new UsuarioResponse(usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone());
    }

    // -------------------------- Regras de negócio para Gestão de Usuários --------------------------------------

    public List<MonitorResponse> listarMonitores() {
        return usuarioRepository.findByTipo(TipoUsuario.MONITOR.getValor())
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
        preencherMonitor(usuario, request);
        return paraMonitorResponse(usuarioRepository.save(usuario));
    }

    public MonitorResponse buscarMonitorPorId(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado");
        }
        MonitorResponse response = paraMonitorResponse(usuarioRepository.findById(id).get());
        return response;
    }

    public MonitorResponse atualizarMonitor(Long id, MonitorRequest request) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado");
        }
        UsuariosEntity monitorParaAtualizar = new UsuariosEntity();
        preencherMonitor(monitorParaAtualizar, request);
        monitorParaAtualizar.setIdUsuario(id);
        return paraMonitorResponse(usuarioRepository.save(monitorParaAtualizar));
    }

    public void excluirMonitor(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado");
        }
        usuarioRepository.deleteById(id);
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

    private void preencherMonitor(UsuariosEntity usuario, MonitorRequest monitorRequest) {
        usuario.setNome(monitorRequest.nome());
        usuario.setEmail(monitorRequest.email());
        usuario.setCpf(monitorRequest.cpf());
        usuario.setTelefone(monitorRequest.telefone().trim());
        usuario.setSenha(monitorRequest.senha());
        usuario.setTipo(TipoUsuario.MONITOR.getValor());
    }
}
