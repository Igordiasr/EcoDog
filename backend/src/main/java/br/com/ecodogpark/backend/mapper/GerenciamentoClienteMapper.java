package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.ContratoGerenciamentoResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.PlanoDisponivelResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.VincularPetResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.VincularPlanoResponse;
import br.com.ecodogpark.backend.entity.ContratosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;

import java.util.List;

public class GerenciamentoClienteMapper {

    public static ContratoGerenciamentoResponse entityParaContratoResponse(
            ContratosEntity contrato,
            Long quantidadeDiarias,
            List<String> diasSemana
    ) {
        return new ContratoGerenciamentoResponse(
                contrato.getIdContrato(),
                contrato.getServicos().getCategoria(),
                contrato.getValor(),
                contrato.getServicos().getModalidade(),
                contrato.getServicos().getFrequencia(),
                contrato.getDataInicio(),
                contrato.getDataFim(),
                quantidadeDiarias,
                diasSemana,
                contrato.getSituacao()
        );
    }

    public static PlanoDisponivelResponse entityParaPlanoResponse(
            ServicosEntity servico
    ) {
        return new PlanoDisponivelResponse(
                servico.getIdServico(),
                servico.getNome(),
                servico.getCategoria(),
                servico.getModalidade(),
                servico.getFrequencia(),
                servico.getValor()
        );
    }

    public static VincularPlanoResponse entityParaVincularPlanoResponse(ContratosEntity contrato) {
        return new VincularPlanoResponse(
                contrato.getIdContrato(),
                contrato.getPet().getIdPet(),
                contrato.getServicos().getIdServico(),
                contrato.getDataInicio(),
                contrato.getDataFim(),
                contrato.getValor(),
                contrato.getSituacao()
        );
    }
}
