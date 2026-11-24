package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
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
    private static final List<String> CATEGORIAS_VALIDAS = List.of("CRECHE", "HOTEL", "DAYUSE");

    private final ServicoRepository servicoRepository;

    public PlanosService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @Transactional(readOnly = true)
    public List<PlanoResponse> listarTodos() {
        return servicoRepository.findAllByModalidadeOrderByNomeAsc(PlanoMapper.MODALIDADE_PLANO)
                .stream().map(plano -> PlanoMapper.paraResponse(plano, buscarBaseParaCategoria(plano.getCategoria())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PlanoResponse buscarPorId(Long id) {
        ServicosEntity plano = buscarPlano(id);
        return PlanoMapper.paraResponse(plano, buscarBaseParaCategoria(plano.getCategoria()));
    }

    @Transactional
    public PlanoResponse criar(CriarPlanoRequest request) {
        ServicosEntity base = buscarServicoBase(request.idServico());
        validarDuplicidade(request.nome(), base.getCategoria(), request.diarias(), null);
        ServicosEntity plano = servicoRepository.save(PlanoMapper.paraServico(request, base));
        return PlanoMapper.paraResponse(plano, base);
    }

    @Transactional
    public PlanoResponse atualizar(Long id, AtualizarPlanoRequest request) {
        ServicosEntity plano = buscarPlano(id);
        ServicosEntity base = buscarServicoBase(request.idServico());
        validarDuplicidade(request.nome(), base.getCategoria(), request.diarias(), plano.getIdServico());
        PlanoMapper.atualizarServico(plano, request, base);
        return PlanoMapper.paraResponse(servicoRepository.save(plano), base);
    }

    @Transactional
    public void deletar(Long id) {
        servicoRepository.delete(buscarPlano(id));
    }

    @Transactional
    public PlanoResponse toggularAtivo(Long id) {
        ServicosEntity plano = buscarPlano(id);
        plano.setStatus(!Boolean.TRUE.equals(plano.getStatus()));
        return PlanoMapper.paraResponse(servicoRepository.save(plano), buscarBaseParaCategoria(plano.getCategoria()));
    }

    @Transactional(readOnly = true)
    public List<ServicoPlanoResponse> listarServicosAtivos() {
        return servicoRepository.findAllByStatusTrueAndModalidadeNotOrderByNomeAsc(PlanoMapper.MODALIDADE_PLANO)
                .stream().filter(servico -> CATEGORIAS_VALIDAS.contains(servico.getCategoria()))
                .map(PlanoMapper::paraServicoResponse).toList();
    }

    private ServicosEntity buscarPlano(Long id) {
        ServicosEntity servico;
        try {
            servico = servicoRepository.findById(Math.toIntExact(id)).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado"));
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado");
        }
        if (!PlanoMapper.MODALIDADE_PLANO.equals(servico.getModalidade())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plano não encontrado");
        }
        return servico;
    }

    private ServicosEntity buscarServicoBase(Long id) {
        ServicosEntity servico;
        try {
            servico = servicoRepository.findById(Math.toIntExact(id)).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço de referência inválido"));
        } catch (ArithmeticException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço de referência inválido");
        }
        if (!Boolean.TRUE.equals(servico.getStatus())
                || PlanoMapper.MODALIDADE_PLANO.equals(servico.getModalidade())
                || !CATEGORIAS_VALIDAS.contains(servico.getCategoria())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Selecione um serviço ativo de Creche, Hotel ou DayUse para definir a categoria do plano");
        }
        return servico;
    }

    private ServicosEntity buscarBaseParaCategoria(String categoria) {
        return servicoRepository.findAllByCategoriaAndStatusTrueAndModalidadeNotOrderByIdServicoAsc(
                categoria, PlanoMapper.MODALIDADE_PLANO).stream().findFirst().orElse(null);
    }

    private void validarDuplicidade(String nome, String categoria, Integer diarias, Integer idPlanoIgnorado) {
        String frequencia = Integer.toString(diarias);
        boolean duplicado = idPlanoIgnorado == null
                ? servicoRepository.existsByNomeIgnoreCaseAndCategoriaAndModalidadeAndFrequencia(
                        nome.trim(), categoria, PlanoMapper.MODALIDADE_PLANO, frequencia)
                : servicoRepository.existsByNomeIgnoreCaseAndCategoriaAndModalidadeAndFrequenciaAndIdServicoNot(
                        nome.trim(), categoria, PlanoMapper.MODALIDADE_PLANO, frequencia, idPlanoIgnorado);
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe um plano com esse nome, categoria e quantidade de diárias");
        }
    }
}
