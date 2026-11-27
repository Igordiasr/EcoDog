package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.enums.CategoriaServico;
import br.com.ecodogpark.backend.enums.ModalidadeServico;
import java.math.BigDecimal;

public final class PlanoMapper {
    private PlanoMapper() {
    }

    public static ServicosEntity paraEntity(CriarPlanoRequest request) {
        ServicosEntity servico = new ServicosEntity();
        preencherDadosCadastrais(servico, request.nome(), request.categoria(), request.modalidade(),
                request.frequencia(), request.valor());
        servico.setStatus(request.status());
        return servico;
    }

    public static void atualizarEntity(ServicosEntity servico, AtualizarPlanoRequest request) {
        preencherDadosCadastrais(servico, request.nome(), request.categoria(), request.modalidade(),
                request.frequencia(), request.valor());
    }

    public static PlanoResponse paraResponse(ServicosEntity servico) {
        return new PlanoResponse(
                servico.getId(),
                servico.getNome(),
                servico.getCategoriaEnum(),
                servico.getModalidadeEnum(),
                servico.getFrequenciaInteger(),
                servico.getValor(),
                servico.getStatus()
        );
    }

    private static void preencherDadosCadastrais(ServicosEntity servico, String nome,
                                                  CategoriaServico categoria,
                                                  ModalidadeServico modalidade,
                                                  Integer frequencia, BigDecimal valor) {
        servico.setNome(nome.trim());
        servico.setCategoriaEnum(categoria);
        servico.setModalidadeEnum(modalidade);
        servico.setFrequenciaInteger(frequencia);
        servico.setValor(valor);
    }
}
