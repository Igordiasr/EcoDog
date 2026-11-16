package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.PlanoDTO.request.AtualizarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.request.CriarPlanoRequest;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.PlanoResponse;
import br.com.ecodogpark.backend.dto.PlanoDTO.response.ServicoPlanoResponse;
import br.com.ecodogpark.backend.entity.PlanosEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;

public final class PlanoMapper {
    private PlanoMapper() {}

    public static PlanosEntity paraEntity(CriarPlanoRequest request, ServicosEntity servico) {
        PlanosEntity plano = new PlanosEntity();
        plano.setNome(request.nome());
        plano.setServico(servico);
        plano.setDiarias(request.diarias());
        plano.setValor(request.valor());
        plano.setAtivo(true);
        return plano;
    }

    public static void atualizarEntity(PlanosEntity plano, AtualizarPlanoRequest request, ServicosEntity servico) {
        plano.setNome(request.nome());
        plano.setServico(servico);
        plano.setDiarias(request.diarias());
        plano.setValor(request.valor());
        plano.setAtivo(request.ativo());
    }

    public static PlanoResponse paraResponse(PlanosEntity plano) {
        return new PlanoResponse(plano.getId(), plano.getNome(), plano.getServico().getIdServico().longValue(),
                plano.getServico().getNome(), plano.getDiarias(), plano.getValor(), plano.getAtivo());
    }

    public static ServicoPlanoResponse paraServicoResponse(ServicosEntity servico) {
        return new ServicoPlanoResponse(servico.getIdServico(), servico.getNome());
    }
}
