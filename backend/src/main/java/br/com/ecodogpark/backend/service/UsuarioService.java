package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.Entity.UsuarioEntity;
import br.com.ecodogpark.backend.dto.UsuarioRequest;
import br.com.ecodogpark.backend.dto.UsuarioResponse;
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

    public UsuarioResponse criar(UsuarioRequest dto) {
        String email = normalizarEmail(dto.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        UsuarioEntity usuario = new UsuarioEntity();
        preencher(usuario, dto, email);
        return paraDto(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(this::paraDto).toList();
    }

    public UsuarioResponse buscarPorId(Long id) {
        return paraDto(obter(id));
    }

    public UsuarioResponse atualizar(Long id, UsuarioRequest dto) {
        String email = normalizarEmail(dto.email());
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        UsuarioEntity usuario = obter(id);
        preencher(usuario, dto, email);
        return paraDto(usuarioRepository.save(usuario));
    }

    public void excluir(Long id) {
        UsuarioEntity usuario = obter(id);
        if (petRepository.existsByTutorId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exclua os pets deste usuário antes de removê-lo");
        }
        usuarioRepository.delete(usuario);
    }

    private UsuarioEntity obter(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void preencher(UsuarioEntity usuario, UsuarioRequest dto, String email) {
        usuario.setNome(dto.nome().trim());
        usuario.setEmail(email);
        usuario.setTelefone(dto.telefone().trim());
        usuario.setSenha(dto.senha());
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private UsuarioResponse paraDto(UsuarioEntity usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getTelefone());
    }
}
