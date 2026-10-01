package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.Entity.UsuarioEntity;
import br.com.ecodogpark.backend.dto.*;
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
        UsuarioEntity usuario = new UsuarioEntity();
        preencher(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listarTutores() {
        return usuarioRepository.findByNivelAcesso(1).stream().map(this::paraUsuarioResponse).toList();
    }

    public UsuarioResponse buscarTutorPorId(Long id) {
        return paraUsuarioResponse(buscarTutor(id));
    }

    public UsuarioResponse atualizarTutor(Long id, UsuarioRequest usuarioRequest) {
        if (usuarioRepository.existsByEmailAndIdNot(usuarioRequest.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        UsuarioEntity usuario = buscarTutor(id);
        preencher(usuario, usuarioRequest);
        return paraUsuarioResponse(usuarioRepository.save(usuario));
    }

    public void excluirTutor(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado");
        }
        if (petRepository.existsByTutorId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exclua os pets deste usuário antes de removê-lo");
        }
        usuarioRepository.deleteById(id);
    }

    private UsuarioEntity buscarTutor(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void preencher(UsuarioEntity usuario, UsuarioRequest usuarioRequest) {
        usuario.setNome(usuarioRequest.nome());
        usuario.setEmail(usuarioRequest.email());
        usuario.setCpf(usuarioRequest.cpf());
        usuario.setTelefone(usuarioRequest.telefone().trim());
        usuario.setSenha(usuarioRequest.senha());
        usuario.setNivelAcesso(1);
    }

    private UsuarioResponse paraUsuarioResponse(UsuarioEntity usuario) {
        return new UsuarioResponse(usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone());
    }

    // -------------------------- Regras de negócio para Gestão de Usuários --------------------------------------

    public List<MonitorResponse> listarMonitores() {
        return usuarioRepository.findByNivelAcesso(2)
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
        UsuarioEntity usuario = new UsuarioEntity();
        paraUsuarioEntity(usuario, request);
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
        UsuarioEntity monitorParaAtualizar = new UsuarioEntity();
        paraUsuarioEntity(monitorParaAtualizar, request);
        monitorParaAtualizar.setIdUsuario(id);
        return paraMonitorResponse(usuarioRepository.save(monitorParaAtualizar));
    }

    public void excluirMonitor(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor não encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    private MonitorResponse paraMonitorResponse(UsuarioEntity usuario) {
        return new MonitorResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataRegistro()
        );
    }

    private void paraUsuarioEntity(UsuarioEntity usuario, MonitorRequest monitorRequest) {
        usuario.setNome(monitorRequest.nome());
        usuario.setEmail(monitorRequest.email());
        usuario.setCpf(monitorRequest.cpf());
        usuario.setTelefone(monitorRequest.telefone().trim());
        usuario.setSenha(monitorRequest.senha());
        usuario.setNivelAcesso(2);
    }
}
