package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.DashboardDTO.request.AlterarMovimentacaoRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.request.ManipulacaoMetaRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.*;
import br.com.ecodogpark.backend.entity.MetasEntity;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardService {
    ContratoRepository contratoRepository;
    MovimentacoesRepository movimentacoesRepository;
    MetaRepository metaRepository;
    AgendamentoRepository agendamentoRepository;
    ServicoRepository servicoRepository;

    public DashboardService(
            ContratoRepository contratoRepository,
            MovimentacoesRepository movimentacoesRepository,
            MetaRepository metaRepository,
            AgendamentoRepository agendamentoRepository,
            ServicoRepository servicoRepository
    ) {
        this.contratoRepository = contratoRepository;
        this.movimentacoesRepository = movimentacoesRepository;
        this.metaRepository = metaRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.servicoRepository = servicoRepository;
    }

    public DadosDashboardResponse buscarDados() {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalDate inicio = hoje.withDayOfMonth(1).minusMonths(11);
        LocalDate fim = hoje.withDayOfMonth(1).plusMonths(1);

        List<KpiReceitasResponse> kpiReceitas = montarKPIReceitas(hoje);
        PlanosAtivosResponse planosAtivos = contratoRepository.buscarPlanosAtivos();
        List<AgendamentosPorServicoResponse> quantidadePetsAgendados = agendamentoRepository.buscarAgendamentosPorServicoParaHoje(hoje);
        List<GraficoReceitaResponse> graficoReceita = buscarReceitaUltimosMeses(inicio, fim);
        List<GraficoNovosServicosResponse> graficoNovosServicos = buscarListaNovosServicos(inicio, fim);
        List<GraficoContratosPorServicoResponse> graficoContratosPorServico = buscarSituacaoServicos();
        List<UltimasMovimentacoesResponse> ultimasMovimentacoes = movimentacoesRepository.buscarUltimasMovimentacoes();

        return new DadosDashboardResponse(
                kpiReceitas,
                planosAtivos,
                quantidadePetsAgendados,
                graficoReceita,
                graficoNovosServicos,
                graficoContratosPorServico,
                ultimasMovimentacoes
        );
    }

    public List<ServicoParaListaResponse> buscarServicos() {
        return servicoRepository.findAll()
                .stream().map(this::servicoParaServicoParaLista).toList();
    }

    public List<MetaParaListaResponse> buscarMetas(LocalDate mesReferencia, String servico) {
        return metaRepository.buscarMetaPorMesEServico(mesReferencia, servico.toUpperCase()).stream().map(this::metaParaMetaParaLista).toList();
    }

    public ManipulacaoMetaResponse cadastrarMeta(ManipulacaoMetaRequest novaMeta) {
        return metaParaManipulacaoMetaResponse(metaRepository.save(criarMetaParaEntity(novaMeta)));
    }

    public ManipulacaoMetaResponse atualizarMeta(ManipulacaoMetaRequest meta, Long id) {
        if (!metaRepository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meta não encontrada");
        return metaParaManipulacaoMetaResponse(metaRepository.save(incluirIdMeta(meta, id)));
    }

    public List<MovimentacaoPendenteResponse> buscarMovimentacoesPendentes() {
        return movimentacoesRepository.buscarMovimentacoesPendentes();
    }

    public MovimentacoesEntity atualizarMovimentacao(AlterarMovimentacaoRequest movimentacao, Long id) {
        if (!movimentacoesRepository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movimentação não encontrada");
        Optional<MovimentacoesEntity> movimentacaoParaAlterar = movimentacoesRepository.findById(id);
        MovimentacoesEntity movimentacaoEntity = movimentacaoParaAlterar.get();
        movimentacaoEntity.setDataPagamento(movimentacao.dataPagamento());
        movimentacaoEntity.setFormaPagamento(movimentacao.formaPagamento());
        movimentacaoEntity.setSituacao("PAGO");
        movimentacaoEntity.setContrato(movimentacao.contrato());
        return movimentacoesRepository.save(movimentacaoEntity);
    }

    // Mappers

    private List<KpiReceitasResponse> montarKPIReceitas(LocalDate hoje) {
        LocalDate inicioMes = hoje.withDayOfMonth(1);

        Map<String, BigDecimal> recebido = transformarValorPorServicoEmMap(
                movimentacoesRepository.buscarTotalRecebidoPorServico(inicioMes, hoje)
        );
        Map<String, BigDecimal> metas = transformarValorPorServicoEmMap(
                metaRepository.buscarMetasPorServico(inicioMes, inicioMes.plusMonths(1))
        );

        return List.of("CRECHE", "HOTEL", "DAYUSE").stream()
                .map(cat -> {
                    BigDecimal acumulado = recebido.getOrDefault(cat, BigDecimal.ZERO);
                    BigDecimal meta = metas.getOrDefault(cat, BigDecimal.ZERO);
                    BigDecimal percentual = meta.signum() == 0
                            ? BigDecimal.ZERO
                            : acumulado.multiply(BigDecimal.valueOf(100)).divide(meta, 1, RoundingMode.HALF_UP);
                    return new KpiReceitasResponse(cat, acumulado, meta, percentual);
                }).toList();
    }

    private Map<String, BigDecimal> transformarValorPorServicoEmMap(List<ValorPorServicoResponse> lista) {
        return lista.stream()
                .collect(Collectors.toMap(ValorPorServicoResponse::categoria, ValorPorServicoResponse::valor));
    }

    private List<GraficoReceitaResponse> buscarReceitaUltimosMeses(LocalDate inicio, LocalDate fim) {
        DateTimeFormatter formatador = DateTimeFormatter.ofPattern("MMMM/yyyy", new Locale("pt", "BR"));

        Map<YearMonth, BigDecimal> previsao = concatenarMesAno(
                metaRepository.buscarReceitasPrevistas(inicio, fim)
        );
        Map<YearMonth, BigDecimal> totalRecebido = concatenarMesAno(
                movimentacoesRepository.buscarReceitasRecebidasUltimosMeses(inicio, fim)
        );

        return IntStream.range(0,12)
                .mapToObj(indice -> {
                    YearMonth mes = YearMonth.from(inicio.plusMonths(indice));

                    BigDecimal previsto = previsao.getOrDefault(mes,BigDecimal.ZERO);
                    BigDecimal recebido = totalRecebido.getOrDefault(mes, BigDecimal.ZERO);

                    return new GraficoReceitaResponse(mes.format(formatador), previsto, recebido);
                }).toList();
    }

    private Map<YearMonth, BigDecimal> concatenarMesAno(List<MetasServicosResponse> lista) {
        return lista.stream()
                .collect(Collectors.toMap(
                        receita -> YearMonth.of(receita.ano(), receita.mes()),
                        MetasServicosResponse::valor
                ));
    }

    private List<GraficoNovosServicosResponse> buscarListaNovosServicos(LocalDate inicio, LocalDate fim) {
        DateTimeFormatter formatador = DateTimeFormatter.ofPattern("MMMM/yyyy", new Locale("pt", "BR"));

        List<NovosServicosMensaisResponse> listaServicos = contratoRepository.buscarNovosServicosPorMes(inicio, fim);

        Map<YearMonth, NovosServicosMensaisResponse> listaServicosMapeado = listaServicos.stream()
                .collect(Collectors.toMap(
                        resultado -> YearMonth.of(
                                resultado.ano(), resultado.mes()
                        ),
                        resultado -> resultado
                ));

        return IntStream.range(6,12)
                .mapToObj(indice -> {
                    YearMonth mes = YearMonth.from(inicio.plusMonths(indice));

                    NovosServicosMensaisResponse dados = listaServicosMapeado.get(mes);

                    Long creche = dados != null ? dados.creche() : 0L;
                    Long hotel = dados != null ? dados.hotel() : 0L;
                    Long dayuse = dados != null ? dados.dayUse() : 0L;
                    String mesReferencia = mes.format(formatador);

                    return new GraficoNovosServicosResponse(mesReferencia, creche, hotel, dayuse);
                }).toList();
    }

    private List<GraficoContratosPorServicoResponse> buscarSituacaoServicos() {
        List<GraficoContratosPorServicoResponse> contratosAtivos = contratoRepository.buscarContratosAtivosPorCategoria();
        Long contratosInativos = contratoRepository.contarContratosInativos();

        List<GraficoContratosPorServicoResponse> listaContratosPorServico = new ArrayList<>(contratosAtivos);
        listaContratosPorServico.add(new GraficoContratosPorServicoResponse("Inativos", contratosInativos));

        return listaContratosPorServico;
    }

    private MetasEntity incluirIdMeta(ManipulacaoMetaRequest meta, Long id) {
        MetasEntity novaMeta = new MetasEntity();
        novaMeta.setIdMeta(id);
        novaMeta.setMesReferencia(meta.mesReferencia());
        novaMeta.setValor(meta.valor());
        novaMeta.setServicos(meta.servico());
        return novaMeta;
    }

    private MetasEntity criarMetaParaEntity(ManipulacaoMetaRequest meta) {
        MetasEntity novaMeta = new MetasEntity();
        novaMeta.setMesReferencia(meta.mesReferencia());
        novaMeta.setValor(meta.valor());
        novaMeta.setServicos(meta.servico());
        return novaMeta;
    }

    private ManipulacaoMetaResponse metaParaManipulacaoMetaResponse(MetasEntity meta) {
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

    private MetaParaListaResponse metaParaMetaParaLista(MetasEntity meta) {
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

    private ServicoParaListaResponse servicoParaServicoParaLista(ServicosEntity servico) {
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
}
