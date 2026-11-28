package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.DashboardDTO.request.ManipulacaoMetaRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.*;
import br.com.ecodogpark.backend.entity.MetasEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DashboardMapper {
    public static ServicoParaListaResponse servicoParaServicoParaLista(ServicosEntity servico) {
        return new ServicoParaListaResponse(
                servico.getIdServico(),
                servico.getNome(),
                servico.getCategoria(),
                servico.getModalidade(),
                servico.getFrequencia(),
                servico.getValor(),
                servico.getStatus()
        );
    }

    public static MetaParaListaResponse metaParaMetaParaLista(MetasEntity meta) {
        return new MetaParaListaResponse(
                meta.getIdMeta(),
                meta.getMesReferencia(),
                meta.getValor(),
                new ServicoParaListaResponse(
                        meta.getServicos().getIdServico(),
                        meta.getServicos().getNome(),
                        meta.getServicos().getCategoria(),
                        meta.getServicos().getModalidade(),
                        meta.getServicos().getFrequencia(),
                        meta.getServicos().getValor(),
                        meta.getServicos().getStatus()
                )
        );
    }

    public static Map<String, BigDecimal> transformarValorPorServicoEmMap(List<ValorPorServicoResponse> lista) {
        return lista.stream()
                .collect(Collectors.toMap(ValorPorServicoResponse::categoria, ValorPorServicoResponse::valor));
    }

    public static Map<YearMonth, BigDecimal> concatenarMesAno(List<MetasServicosResponse> lista) {
        return lista.stream()
                .collect(Collectors.toMap(
                        receita -> YearMonth.of(receita.ano(), receita.mes()),
                        MetasServicosResponse::valor
                ));
    }

    public static MetasEntity incluirIdMeta(ManipulacaoMetaRequest meta, Long id) {
        MetasEntity novaMeta = new MetasEntity();
        novaMeta.setIdMeta(id);
        novaMeta.setMesReferencia(meta.mesReferencia());
        novaMeta.setValor(meta.valor());
        novaMeta.setServicos(meta.servico());
        return novaMeta;
    }

    public static MetasEntity criarMetaParaEntity(ManipulacaoMetaRequest meta) {
        MetasEntity novaMeta = new MetasEntity();
        novaMeta.setMesReferencia(meta.mesReferencia());
        novaMeta.setValor(meta.valor());
        novaMeta.setServicos(meta.servico());
        return novaMeta;
    }

    public static ManipulacaoMetaResponse metaParaManipulacaoMetaResponse(MetasEntity meta) {
        return new ManipulacaoMetaResponse(
                meta.getMesReferencia(),
                meta.getValor(),
                new ServicoParaListaResponse(
                        meta.getServicos().getIdServico(),
                        meta.getServicos().getNome(),
                        meta.getServicos().getCategoria(),
                        meta.getServicos().getModalidade(),
                        meta.getServicos().getFrequencia(),
                        meta.getServicos().getValor(),
                        meta.getServicos().getStatus()
                )
        );
    }

    public static PetsPrevistosKpiResponse paraPetsPrevistosKpiResponse(
            List<AgendamentosPorServicoResponse> agendamentosPorServico,
            QuantidadeVagasDoDiaResponse vagas
    ) {
        return new PetsPrevistosKpiResponse(
                agendamentosPorServico,
                vagas.quantideVagas()
        );
    }
}
