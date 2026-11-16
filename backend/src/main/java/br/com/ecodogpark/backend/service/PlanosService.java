package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
import br.com.ecodogpark.backend.entity.PlanosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.mapper.PlanoMapper;
import br.com.ecodogpark.backend.repository.PlanosRepository;
import br.com.ecodogpark.backend.repository.ServicoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlanosService {
    private final PlanosRepository planosRepository;
    private final ServicoRepository servicoRepository;

    public PlanosService(PlanosRepository planosRepository, ServicoRepository servicoRepository) {
        this.planosRepository = planosRepository;
        this.servicoRepository = servicoRepository;
    }

    @Transactional(readOnly = true)
    public List<PlanoResponse> listarTodos() {
        return planosRepository.findAllByOrderByNomeAsc().stream().map(PlanoMapper::paraResponse).toList();
    }

    @Transactional(readOnly = true)
    public PlanoResponse buscarPorId(Long id) {
        return PlanoMapper.paraResponse(buscarEntity(id));
    }

    @Transactional
    public PlanoResponse criar(CriarPlanoRequest request) {
        ServicosEntity servico = buscarServico(request.idServico());
        return PlanoMapper.paraResponse(planosRepository.save(PlanoMapper.paraEntity(request, servico)));
    }

    @Transactional
    public PlanoResponse atualizar(Long id, AtualizarPlanoRequest request) {
        PlanosEntity plano = buscarEntity(id);
        ServicosEntity servico = buscarServico(request.idServico());
        PlanoMapper.atualizarEntity(plano, request, servico);
        return PlanoMapper.paraResponse(planosRepository.save(plano));
    }

    @Transactional
    public void deletar(Long id) {
        planosRepository.delete(buscarEntity(id));
    }

    @Transactional
    public PlanoResponse toggularAtivo(Long id) {
        PlanosEntity plano = buscarEntity(id);
        plano.setAtivo(!Boolean.TRUE.equals(plano.getAtivo()));
        return PlanoMapper.paraResponse(planosRepository.save(plano));
    }

    @Transactional(readOnly = true)
    public List<ServicoPlanoResponse> listarServicosAtivos() {
        return servicoRepository.findAllByStatusTrueOrderByNomeAsc().stream()
                .map(PlanoMapper::paraServicoResponse).toList();
    }

    private PlanosEntity buscarEntity(Long id) {
        return planosRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Plano não encontrado"));
    }

    private ServicosEntity buscarServico(Long id) {
        try {
            return servicoRepository.findById(Math.toIntExact(id)).orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Serviço inválido"));
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço inválido");
        }
    }
}
