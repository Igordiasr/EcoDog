package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.mapper.PlanoMapper;
import br.com.ecodogpark.backend.repository.ServicoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlanosService {
    private final ServicoRepository repository;
    public PlanosService(ServicoRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<PlanoResponse> listarTodos(Boolean status) {
        List<ServicosEntity> registros = status == null
                ? repository.findAllByOrderByNomeAsc()
                : repository.findAllByStatusOrderByNomeAsc(status);

        return registros.stream().map(PlanoMapper::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public PlanoResponse buscarPorId(Long id) {
        return PlanoMapper.paraResponse(buscar(id));
    }

    @Transactional
    public PlanoResponse criar(CriarPlanoRequest request) {
        return PlanoMapper.paraResponse(repository.save(PlanoMapper.paraEntity(request)));
    }

    @Transactional
    public PlanoResponse atualizar(Long id, AtualizarPlanoRequest request) {
        ServicosEntity servico = buscar(id);
        PlanoMapper.atualizarEntity(servico, request);

        return PlanoMapper.paraResponse(repository.save(servico));
    }

    @Transactional
    public PlanoResponse atualizarStatus(Long id, Boolean status) {
        ServicosEntity servico = buscar(id);
        servico.setStatus(status);

        return PlanoMapper.paraResponse(repository.save(servico));
    }

    private ServicosEntity buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Serviço/plano não encontrado"));
    }
}
