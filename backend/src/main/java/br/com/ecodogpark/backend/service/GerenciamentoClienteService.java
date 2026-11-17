package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.VincularPlanoRequest;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.GerenciamentoClienteResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.PlanoDisponivelResponse;
import br.com.ecodogpark.backend.entity.ContratosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.repository.ContratoRepository;
import br.com.ecodogpark.backend.repository.ServicosRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GerenciamentoClienteService {

    private final ContratoRepository contratoRepository;
    private final ServicosRepository servicosRepository;

    public GerenciamentoClienteService(
            ContratoRepository contratoRepository,
            ServicosRepository servicosRepository
    ) {
        this.contratoRepository = contratoRepository;
        this.servicosRepository = servicosRepository;
    }

    @Transactional(readOnly = true)
    public List<GerenciamentoClienteResponse> listarClientes(String pesquisa) {
        List<ContratosEntity> contratos;

        if (pesquisa == null || pesquisa.isBlank()) {
            contratos = contratoRepository.buscarContratosGerenciamento();
        } else {
            contratos = contratoRepository.pesquisarContratosGerenciamento(
                    pesquisa.trim()
            );
        }
        return contratos.stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanoDisponivelResponse> listarPlanos() {
        return servicosRepository.findByStatusTrueOrderByNomeAsc()
                .stream()
                .map(servico -> new PlanoDisponivelResponse(
                        servico.getIdServico(),
                        servico.getNome(),
                        servico.getCategoria(),
                        servico.getModalidade(),
                        servico.getFrequencia(),
                        servico.getValor()
                ))
                .toList();
    }

    @Transactional
    public GerenciamentoClienteResponse atualizarContrato(
            Long idContrato,
            AtualizarContratoRequest requisicao
    ) {
        ContratosEntity contrato = buscarContrato(idContrato);

        if (requisicao.dataFim().isBefore(requisicao.dataInicio())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A data de término não pode ser anterior à data de início."
            );
        }
        contrato.setDataInicio(requisicao.dataInicio());
        contrato.setDataFim(requisicao.dataFim());
        contrato.setValor(requisicao.valor());

        contratoRepository.save(contrato);

        return paraResponse(contrato);
    }

    @Transactional
    public GerenciamentoClienteResponse alterarStatus(
            Long idContrato,
            AlterarStatusContratoRequest requisicao
    ) {
        ContratosEntity contrato = buscarContrato(idContrato);

        if (requisicao.ativo()) {
            contrato.setSituacao("ATIVO");
        } else {
            contrato.setSituacao("ENCERRADO");
        }

        contratoRepository.save(contrato);

        return paraResponse(contrato);
    }

    @Transactional
    public GerenciamentoClienteResponse vincularPlano(
            Long idContrato,
            VincularPlanoRequest requisicao
    ) {
        ContratosEntity contrato = buscarContrato(idContrato);

        ServicosEntity servico = servicosRepository.findById(
                requisicao.idServico()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Plano não encontrado."
        ));
        if (!Boolean.TRUE.equals(servico.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Não é possível vincular um plano inativo."
            );
        }

        contrato.setServicos(servico);
        contrato.setValor(servico.getValor());

        contratoRepository.save(contrato);

        return paraResponse(contrato);
    }

    private ContratosEntity buscarContrato(Long idContrato) {
        return contratoRepository.buscarContratoPorIdGerenciamento(idContrato)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contrato não encontrado."
                ));
    }

    private GerenciamentoClienteResponse paraResponse(
            ContratosEntity contrato
    ) {
        long quantidadeDias = ChronoUnit.DAYS.between(
                contrato.getDataInicio(),
                contrato.getDataFim()
        ) + 1;

        String pacote = quantidadeDias +
                (quantidadeDias == 1 ? " diária" : " diárias");

        return new GerenciamentoClienteResponse(
                contrato.getIdContrato(),
                contrato.getPet().getFkUsuario().getNome(),
                contrato.getPet().getNome(),
                contrato.getServicos().getCategoria(),
                contrato.getValor(),
                contrato.getServicos().getFrequencia(),
                pacote,
                "ATIVO".equalsIgnoreCase(contrato.getSituacao())
        );
    }
}