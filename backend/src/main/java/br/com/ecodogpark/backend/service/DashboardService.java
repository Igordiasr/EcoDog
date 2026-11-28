package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.DashboardDTO.request.AlterarMovimentacaoRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.request.ManipulacaoMetaRequest;
import br.com.ecodogpark.backend.dto.DashboardDTO.response.*;
import br.com.ecodogpark.backend.entity.MetasEntity;
import br.com.ecodogpark.backend.entity.MovimentacoesEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.mapper.DashboardMapper;
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
    private final ContratoRepository contratoRepository;
    private final MovimentacoesRepository movimentacoesRepository;
    private final MetaRepository metaRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ServicoRepository servicoRepository;
    private final CalendarioRepository calendarioRepository;

    public DashboardService(
            ContratoRepository contratoRepository,
            MovimentacoesRepository movimentacoesRepository,
            MetaRepository metaRepository,
            AgendamentoRepository agendamentoRepository,
            ServicoRepository servicoRepository,
            CalendarioRepository calendarioRepository
    ) {
        this.contratoRepository = contratoRepository;
        this.movimentacoesRepository = movimentacoesRepository;
        this.metaRepository = metaRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.servicoRepository = servicoRepository;
        this.calendarioRepository = calendarioRepository;
    }

    public DadosDashboardResponse buscarDados() {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalDate inicio = hoje.withDayOfMonth(1).minusMonths(11);
        LocalDate fim = hoje.withDayOfMonth(1).plusMonths(1);

        List<KpiReceitasResponse> kpiReceitas = montarKPIReceitas(hoje);
        PlanosAtivosResponse planosAtivos = contratoRepository.buscarPlanosAtivos();
        PetsPrevistosKpiResponse quantidadePetsAgendados = buscarPetsPrevistos(hoje);
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
                .stream().map(DashboardMapper::servicoParaServicoParaLista).toList();
    }

    public List<MetaParaListaResponse> buscarMetas(LocalDate mesReferencia, String servico) {
        LocalDate inicioMes = mesReferencia.withDayOfMonth(1);
        return metaRepository.buscarMetaPorMesEServico(inicioMes, servico.toUpperCase()).stream().map(DashboardMapper::metaParaMetaParaLista).toList();
    }

    public ManipulacaoMetaResponse cadastrarMeta(ManipulacaoMetaRequest novaMeta) {
        return DashboardMapper.metaParaManipulacaoMetaResponse(metaRepository.save(DashboardMapper.criarMetaParaEntity(novaMeta)));
    }

    public ManipulacaoMetaResponse atualizarMeta(ManipulacaoMetaRequest meta, Long id) {
        if (!metaRepository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meta não encontrada");
        return DashboardMapper.metaParaManipulacaoMetaResponse(metaRepository.save(DashboardMapper.incluirIdMeta(meta, id)));
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

        Map<String, BigDecimal> recebido = DashboardMapper.transformarValorPorServicoEmMap(
                movimentacoesRepository.buscarTotalRecebidoPorServico(inicioMes, hoje)
        );
        Map<String, BigDecimal> metas = DashboardMapper.transformarValorPorServicoEmMap(
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

    private List<GraficoReceitaResponse> buscarReceitaUltimosMeses(LocalDate inicio, LocalDate fim) {
        DateTimeFormatter formatador = DateTimeFormatter.ofPattern("MMMM/yyyy", new Locale("pt", "BR"));

        Map<YearMonth, BigDecimal> previsao = DashboardMapper.concatenarMesAno(
                metaRepository.buscarReceitasPrevistas(inicio, fim)
        );
        Map<YearMonth, BigDecimal> totalRecebido = DashboardMapper.concatenarMesAno(
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

    private PetsPrevistosKpiResponse buscarPetsPrevistos(LocalDate hoje) {
        List<AgendamentosPorServicoResponse> agendamentosPorServico = agendamentoRepository.buscarAgendamentosPorServicoParaHoje(hoje);
        QuantidadeVagasDoDiaResponse totalVagas = calendarioRepository.buscarQuantidadeTotalVagasHoje(hoje);
        return DashboardMapper.paraPetsPrevistosKpiResponse(agendamentosPorServico, totalVagas);
    }
}
