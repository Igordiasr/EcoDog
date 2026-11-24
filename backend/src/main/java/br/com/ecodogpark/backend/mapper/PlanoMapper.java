package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
import br.com.ecodogpark.backend.entity.ServicosEntity;

public final class PlanoMapper {
    public static final String MODALIDADE_PLANO = "PLANO";

    private PlanoMapper() {}

    public static ServicosEntity paraServico(CriarPlanoRequest request, ServicosEntity servicoBase) {
        ServicosEntity plano = new ServicosEntity();
        plano.setNome(request.nome().trim());
        plano.setCategoria(servicoBase.getCategoria());
        plano.setModalidade(MODALIDADE_PLANO);
        plano.setFrequencia(Integer.toString(request.diarias()));
        plano.setValor(request.valor());
        plano.setStatus(true);
        return plano;
    }

    public static void atualizarServico(ServicosEntity plano, AtualizarPlanoRequest request,
                                        ServicosEntity servicoBase) {
        plano.setNome(request.nome().trim());
        plano.setCategoria(servicoBase.getCategoria());
        plano.setModalidade(MODALIDADE_PLANO);
        plano.setFrequencia(Integer.toString(request.diarias()));
        plano.setValor(request.valor());
        plano.setStatus(request.ativo());
    }

    public static PlanoResponse paraResponse(ServicosEntity plano, ServicosEntity servicoBase) {
        Long idServico = servicoBase == null ? plano.getIdServico().longValue()
                : servicoBase.getIdServico().longValue();
        String nomeServico = servicoBase == null ? rotuloCategoria(plano.getCategoria()) : servicoBase.getNome();
        return new PlanoResponse(plano.getIdServico().longValue(), plano.getNome(), idServico, nomeServico,
                quantidadeDiarias(plano.getFrequencia()), plano.getValor(), plano.getStatus());
    }

    public static ServicoPlanoResponse paraServicoResponse(ServicosEntity servico) {
        return new ServicoPlanoResponse(servico.getIdServico(), servico.getNome());
    }

    private static String rotuloCategoria(String categoria) {
        return switch (categoria) {
            case "CRECHE" -> "Creche";
            case "HOTEL" -> "Hotel";
            case "DAYUSE" -> "DayUse";
            default -> categoria;
        };
    }

    private static Integer quantidadeDiarias(String frequencia) {
        if (frequencia == null || frequencia.isBlank()) {
            return null;
        }
        try {
            return Integer.valueOf(frequencia.trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
