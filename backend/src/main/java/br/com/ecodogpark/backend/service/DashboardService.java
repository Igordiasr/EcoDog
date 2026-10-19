package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.DashboardDTO.*;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;
import br.com.ecodogpark.backend.repository.ContratosRepository;
import br.com.ecodogpark.backend.repository.MetasRepository;
import br.com.ecodogpark.backend.repository.MovimentacoesRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DashboardService {
    ContratosRepository contratosRepository;
    MovimentacoesRepository movimentacoesRepository;
    MetasRepository metasRepository;
    AgendamentoRepository agendamentoRepository;

    public DashboardService(ContratosRepository contratosRepository, MovimentacoesRepository movimentacoesRepository, MetasRepository metasRepository, AgendamentoRepository agendamentoRepository) {
        this.contratosRepository = contratosRepository;
        this.movimentacoesRepository = movimentacoesRepository;
        this.metasRepository = metasRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public DadosDashboardResponse buscarDados() {
        LocalDate hoje = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        LocalDate inicio = hoje.withDayOfMonth(1).minusMonths(11);
        LocalDate fim = hoje.withDayOfMonth(1).plusMonths(1);

        List<KpiReceitasResponse> kpiReceitas = montarKPIReceitas(hoje);
        PlanosAtivosResponse planosAtivos = contratosRepository.buscarPlanosAtivos();
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

    private List<KpiReceitasResponse> montarKPIReceitas(LocalDate hoje) {
        LocalDate inicioMes = hoje.withDayOfMonth(1);

        Map<String, BigDecimal> recebido = transformarValorPorServicoEmMap(
                movimentacoesRepository.buscarTotalRecebidoPorServico(inicioMes, hoje)
        );
        Map<String, BigDecimal> metas = transformarValorPorServicoEmMap(
                metasRepository.buscarMetasPorServico(inicioMes, inicioMes.plusMonths(1))
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
                metasRepository.buscarReceitasPrevistas(inicio, fim)
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

        List<NovosServicosMensaisResponse> listaServicos = contratosRepository.buscarNovosServicosPorMes(inicio, fim);

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
        List<GraficoContratosPorServicoResponse> contratosAtivos = contratosRepository.buscarContratosAtivosPorCategoria();
        Long contratosInativos = contratosRepository.contarContratosInativos();

        List<GraficoContratosPorServicoResponse> resposta = new ArrayList<>(contratosAtivos);
        resposta.add(new GraficoContratosPorServicoResponse("Inativos", contratosInativos));

        return resposta;
    }
}
