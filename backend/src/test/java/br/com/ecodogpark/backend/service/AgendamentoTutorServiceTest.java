package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.DiaSemana;
import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import br.com.ecodogpark.backend.exception.*;
import br.com.ecodogpark.backend.mapper.AgendamentoMapper;
import br.com.ecodogpark.backend.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AgendamentoTutorServiceTest {
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private CalendarioRepository calendarioRepository;
    @Mock
    private ContratoRepository contratoRepository;
    @Mock
    private MovimentacoesRepository movimentacoesRepository;
    @Mock
    private ContratoDiasSemanaRepository contratoDiasSemanaRepository;
    @Mock
    private PetRepository petRepository;
    @Mock
    private ServicosRepository servicoRepository;

    @InjectMocks
    private AgendamentoTutorService agendamentoTutorService;

    // Métodos auxiliares

    private PetsEntity criarPet(UUID id, String nome, boolean adaptado) {
        PetsEntity pet = new PetsEntity();
        pet.setIdPet(id);
        pet.setNome(nome);
        pet.setStatusAdaptacao(adaptado);
        return pet;
    }

    private PetsEntity criarPet(UUID id, String nome) {
        return criarPet(id, nome, true);
    }

    private ServicosEntity criarServico(Integer id, String categoria, String modalidade, String valor, String frequencia) {
        ServicosEntity servico = new ServicosEntity();
        servico.setIdServico(id);
        servico.setNome("Serviço de teste");
        servico.setCategoria(categoria);
        servico.setModalidade(modalidade);
        servico.setValor(new BigDecimal(valor));
        servico.setFrequencia(frequencia);
        servico.setStatus(true);
        return servico;
    }

    private ServicosEntity criarServico(Integer id, String categoria, String modalidade, String valor) {
        return criarServico(id, categoria, modalidade, valor, null);
    }

    private OrcamentoRequest criarRequestAvulso(Integer idServico, List<UUID> idsPets, List<LocalDate> datas) {
        return new OrcamentoRequest(idServico, idsPets, datas, null, List.of());
    }

    private OrcamentoRequest criarRequestAvulso(Integer idServico, UUID idPet, LocalDate data) {
        return criarRequestAvulso(idServico, List.of(idPet), List.of(data));
    }

    private OrcamentoRequest criarRequestPlano(Integer idServico, List<UUID> idsPets, LocalDate inicio, List<DiaSemana> dias) {
        return new OrcamentoRequest(idServico, idsPets, null, inicio, dias);
    }

    private void prepararServico(ServicosEntity servico) {
        when(servicoRepository.findById(servico.getIdServico())).thenReturn(Optional.of(servico));
    }

    private void prepararServicoEPet(ServicosEntity servico, UUID idTutor, PetsEntity... pets) {
        prepararServico(servico);
        List<UUID> ids = Arrays.stream(pets).map(PetsEntity::getIdPet).toList();
        when(petRepository.findByIdPetInAndFkUsuarioIdUsuario(ids, idTutor)).thenReturn(List.of(pets));
    }

    private CalendarioEntity criarCalendarioCreche(LocalDate data, Integer vagas) {
        CalendarioEntity calendario = new CalendarioEntity();
        calendario.setData(data);
        calendario.setVagasCreche(vagas);
        return calendario;
    }

    private CalendarioEntity criarCalendarioHotel(LocalDate data, Integer vagas) {
        CalendarioEntity calendario = new CalendarioEntity();
        calendario.setData(data);
        calendario.setVagasHotel(vagas);
        return calendario;
    }

    @Nested
    @DisplayName("Buscar pets para o tutor.")
    public class BuscarPetsTest {
        @Test
        @DisplayName("Deve retornar lista vazia quando pet não possuir pets cadastrados")
        void buscarPetsQuandoTutorNaoPossuiPetsDeveRetornarListaVazia() {
            UUID idTutor = UUID.randomUUID();

            when(petRepository.findByFkUsuarioIdUsuario(idTutor)).thenReturn(List.of());

            List<PetsDoTutorResponse> resultado = agendamentoTutorService.buscarPets(idTutor);

            Assertions.assertTrue(resultado.isEmpty());

            verify(petRepository).findByFkUsuarioIdUsuario(idTutor);
        }

        @Test
        @DisplayName("Deve retornar a lista dos pets que estão cadastrados")
        void buscarPetsQuandoTutorPossuiPetsDeveRetornarTodosCorretamente() {
            UUID idTutor = UUID.randomUUID();

            PetsEntity pet1 = criarPet(UUID.randomUUID(), "Rex", true);
            PetsEntity pet2 = criarPet(UUID.randomUUID(), "Bob", false);

            when(petRepository.findByFkUsuarioIdUsuario(idTutor)).thenReturn(List.of(pet1, pet2));

            List<PetsDoTutorResponse> resultado = agendamentoTutorService.buscarPets(idTutor);

            assertEquals(2, resultado.size());
            assertEquals(pet1.getIdPet(), resultado.get(0).idPet());
            assertEquals("Rex", resultado.get(0).nomePet());
            assertEquals(pet2.getIdPet(), resultado.get(1).idPet());
            assertEquals("Bob", resultado.get(1).nomePet());

            verify(petRepository).findByFkUsuarioIdUsuario(idTutor);
        }
    }

    @Nested
    @DisplayName("Testes de listar serviços disponiveis para agendamento")
    public class ListarServicosTest {
        @Test
        @DisplayName("Deve retornar lista de serviços ativos com categoria válida")
        void listarServicosQuandoCategoriaValidaDeveRetornarServicosAtivos() {
            String categoria = "DAYUSE";

            ServicoAtivoResponse servico1 = new ServicoAtivoResponse(1, "DayUse avulsa", "DAYUSE", "AVULSA", null, new BigDecimal("90.00"));
            ServicoAtivoResponse servico2 = new ServicoAtivoResponse(6, "Hotel diarias", "HOTEL", "DIARIA", null, new BigDecimal("150.00"));

            when(servicoRepository.buscarServicosAtivos(categoria)).thenReturn(List.of(servico1, servico2));

            List<ServicoAtivoResponse> resultado = agendamentoTutorService.listarServicos(categoria);

            assertEquals(2, resultado.size());
            assertEquals(servico1, resultado.get(0));
            assertEquals(servico2, resultado.get(1));

            verify(servicoRepository).buscarServicosAtivos(categoria);
        }

        @Test
        @DisplayName("Deve retornar uma lista vazio quando não houver nenhum serviço ou nenhum ativo")
        void listarServicosQuandoNaoExistemServicosAtivosDeveRetornarListaVazia() {
            String categoria = "DAYUSE";

            when(servicoRepository.buscarServicosAtivos(categoria)).thenReturn(List.of());

            List<ServicoAtivoResponse> resultado = agendamentoTutorService.listarServicos(categoria);

            Assertions.assertTrue(resultado.isEmpty());

            verify(servicoRepository).buscarServicosAtivos(categoria);
        }
    }

    @Nested
    @DisplayName("Testes de buscar disponibilidade no calendario")
    public class BuscarDisponibilidadeTest {
        private static final Integer ANO = 2026;
        private static final Integer MES = 12;

        private final LocalDate primeiroDia = LocalDate.of(ANO, MES, 1);
        private final LocalDate ultimoDia = primeiroDia.withDayOfMonth(primeiroDia.lengthOfMonth());

        private void prepararBuscaMensal(String servico, CalendarioEntity calendario, List<DiasComAgendamentoResponse> agendamentos) {
            when(calendarioRepository.buscarCalendario(primeiroDia, ultimoDia)).thenReturn(List.of(calendario));

            when(agendamentoRepository.buscarAgendamentoPorServico(
                    servico,
                    primeiroDia.atStartOfDay(),
                    ultimoDia.plusDays(1).atStartOfDay()
            )).thenReturn(agendamentos);
        }

        private List<VagasDisponiveisResponse> buscar(String servico) {
            return agendamentoTutorService.buscarDisponibilidade(servico, ANO, MES);
        }

        @Test
        @DisplayName("Deve retornar corretamente a disponibilidade quando serviço for válido")
        void buscarDisponibilidadeDeveRetornarCorretamenteQuandoServicoValido() {
            String servico = "DAYUSE";

            prepararBuscaMensal(servico,
                    criarCalendarioCreche(primeiroDia, 10),
                    List.of(new DiasComAgendamentoResponse(primeiroDia, 3L)));

            List<VagasDisponiveisResponse> resultado = buscar(servico);

            assertEquals(31, resultado.size());
            assertEquals(7L, resultado.getFirst().vagasDisponiveis());

            verify(calendarioRepository).buscarCalendario(primeiroDia, ultimoDia);
            verify(agendamentoRepository).buscarAgendamentoPorServico(
                    servico,
                    primeiroDia.atStartOfDay(),
                    ultimoDia.plusDays(1).atStartOfDay()
            );
        }

        @Test
        @DisplayName("Deve lançar exceção quando invocado com serviço inválido")
        void buscarDisponibilidadeDeveLancarExceptionQuandoServicoInvalido() {
            ServicoInvalidoException exception = assertThrows(ServicoInvalidoException.class,
                    () -> buscar("INVALIDO")
            );

            assertNotNull(exception);

            verify(calendarioRepository, Mockito.never()).buscarCalendario(any(LocalDate.class), any(LocalDate.class));
            verify(agendamentoRepository, Mockito.never()).buscarAgendamentoPorServico(anyString(), any(LocalDateTime.class), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("Deve utilizar vagas de hotel quando serviço for HOTEL")
        void buscarDisponibilidadeDeveUtilizarVagasDeHotelQuandoServicoHotel() {
            String servico = "HOTEL";

            prepararBuscaMensal(servico, criarCalendarioHotel(primeiroDia, 15), List.of());

            assertEquals(15L, buscar(servico).getFirst().vagasDisponiveis());
        }

        @Test
        @DisplayName("Deve retornar zero vagas quando agendamentos ultrapassarem a capacidade")
        void buscarDisponibilidadeDeveRetornarZeroVagasQuandoAgendamentosUltrapassaremCapacidade() {
            String servico = "DAYUSE";

            prepararBuscaMensal(servico,
                    criarCalendarioCreche(primeiroDia, 10),
                    List.of(new DiasComAgendamentoResponse(primeiroDia, 12L)));

            assertEquals(0L, buscar(servico).getFirst().vagasDisponiveis());
        }
    }

    @Nested
    @DisplayName("Testes de calcular orçamento")
    public class CalcularOrcamentoTest {
        private final UUID idTutor = UUID.randomUUID();

        private ServicosEntity servicoAvulso() {
            return criarServico(1, "DAYUSE", "AVULSO", "90.00");
        }

        private ServicosEntity servicoPlano(String frequencia) {
            return criarServico(3, "CRECHE", "PLANO", "300.00", frequencia);
        }

        private OrcamentoRequest requestPlano(List<UUID> pets, List<DiaSemana> dias) {
            return criarRequestPlano(3, pets, LocalDate.now().plusDays(5), dias);
        }

        private <T extends Exception> void assertOrcamentoLanca(Class<T> tipo, String mensagem, OrcamentoRequest request) {
            T exception = assertThrows(tipo, () -> agendamentoTutorService.calcularOrcamento(request, idTutor));
            assertEquals(mensagem, exception.getMessage());
        }

        @Test
        @DisplayName("Deve calcular corretamente quando serviço avulso e pets forem válidos")
        void calcularOrcamentoDeveRetornarCorretamenteQuandoServicoAvulsoEPetsValidos() {
            PetsEntity pet1 = criarPet(UUID.randomUUID(), "Rex");
            PetsEntity pet2 = criarPet(UUID.randomUUID(), "Bob");

            OrcamentoRequest request = criarRequestAvulso(
                    1,
                    List.of(pet1.getIdPet(), pet2.getIdPet()),
                    List.of(LocalDate.now().plusDays(1), LocalDate.now().plusDays(2))
            );

            prepararServicoEPet(servicoAvulso(), idTutor, pet1, pet2);

            OrcamentoResponse resultado = agendamentoTutorService.calcularOrcamento(request, idTutor);

            assertNotNull(resultado);
            assertEquals(new BigDecimal("360.00"), resultado.valorTotal());
        }

        @Test
        @DisplayName("Deve calcular corretamente quando serviço for plano e dias selecionados forem válidos")
        void calcularOrcamentoDeveRetornarCorretamenteQuandoServicoPlanoValido() {
            PetsEntity pet = criarPet(UUID.randomUUID(), "Rex");

            OrcamentoRequest request = requestPlano(
                    List.of(pet.getIdPet()),
                    List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA)
            );

            prepararServicoEPet(servicoPlano("3"), idTutor, pet);

            OrcamentoResponse resultado = agendamentoTutorService.calcularOrcamento(request, idTutor);

            assertNotNull(resultado);
            assertEquals(new BigDecimal("300.00"), resultado.valorTotal());
        }

        @Test
        @DisplayName("Deve lançar exceção quando serviço não existir ou estiver inativo")
        void calcularOrcamentoDeveLancarExceptionQuandoServicoNaoExistirOuEstiverInativo() {
            OrcamentoRequest request = criarRequestAvulso(1, UUID.randomUUID(), LocalDate.now().plusDays(1));

            when(servicoRepository.findById(1)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> agendamentoTutorService.calcularOrcamento(request, idTutor));

            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        }

        @Test
        @DisplayName("Deve lançar exceção quando plano não possuir dias selecionados")
        void calcularOrcamentoDeveLancarExceptionQuandoPlanoNaoPossuirDiasSelecionados() {
            prepararServico(servicoPlano("3"));

            assertOrcamentoLanca(DiasSelecionadosInvalidosException.class,
                    "Selecione os dias da semana do plano",
                    requestPlano(List.of(UUID.randomUUID()), List.of()));
        }

        @Test
        @DisplayName("Deve lançar exceção quando plano possuir dias da semana repetidos")
        void calcularOrcamentoDeveLancarExceptionQuandoPlanoPossuirDiasRepetidos() {
            prepararServico(servicoPlano("2"));

            assertOrcamentoLanca(DiasSelecionadosInvalidosException.class,
                    "Não é permitido selecionar dias repetidos",
                    requestPlano(List.of(UUID.randomUUID()), List.of(DiaSemana.SEGUNDA, DiaSemana.SEGUNDA)));
        }

        @Test
        @DisplayName("Deve lançar exceção quando nenhum pet for selecionado")
        void calcularOrcamentoDeveLancarExceptionQuandoNenhumPetForSelecionado() {
            prepararServico(servicoAvulso());

            assertOrcamentoLanca(NenhumPetSelecionadoException.class,
                    "Selecione ao menos um pet",
                    criarRequestAvulso(1, List.of(), List.of(LocalDate.now().plusDays(1))));
        }

        @Test
        @DisplayName("Deve lançar exceção quando pet não possuir adaptação")
        void calcularOrcamentoDeveLancarExceptionQuandoPetNaoPossuirAdaptacao() {
            PetsEntity pet = criarPet(UUID.randomUUID(), "Rex", false);

            prepararServicoEPet(servicoAvulso(), idTutor, pet);

            assertOrcamentoLanca(PetSemAdaptacaoException.class,
                    "Rex não possui adaptação na Ecodog.",
                    criarRequestAvulso(1, pet.getIdPet(), LocalDate.now().plusDays(1)));
        }

        @Test
        @DisplayName("Deve lançar exceção quando data de utilização estiver no passado")
        void calcularOrcamentoDeveLancarExceptionQuandoDataUtilizacaoEstiverNoPassado() {
            prepararServico(servicoAvulso());

            assertOrcamentoLanca(DataInvalidaException.class,
                    "Não é possível agendar datas passadas.",
                    criarRequestAvulso(1, UUID.randomUUID(), LocalDate.now().minusDays(1)));
        }
    }

    @Nested
    @DisplayName("Testes de criar agendamentos")
    public class CriarAgendamentoTest {
        private MockedStatic<AgendamentoMapper> mapper;

        @BeforeEach
        void configurarMapper() {
            mapper = Mockito.mockStatic(AgendamentoMapper.class);
        }

        @AfterEach
        void fecharMapper() {
            mapper.close();
        }

        private void criarAvulsoEVerificar(Integer idServico, String categoria, String valor, Boolean tutorTemHistorico, boolean pendente) {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();
            LocalDate data = LocalDate.now().plusDays(5);

            PetsEntity pet = criarPet(idPet, "Rex");
            ServicosEntity servico = criarServico(idServico, categoria, "AVULSO", valor);

            ContratosEntity contrato = mock(ContratosEntity.class);
            MovimentacoesEntity movimentacao = mock(MovimentacoesEntity.class);
            AgendamentosEntity agendamento = mock(AgendamentosEntity.class);
            AgendamentoCriadoResponse response = mock(AgendamentoCriadoResponse.class);

            prepararServicoEPet(servico, idTutor, pet);
            prepararDisponibilidade(categoria, data);

            if (tutorTemHistorico != null) {
                when(contratoRepository.existsByPetFkUsuarioIdUsuarioAndSituacaoIn(idTutor, List.of("ATIVO", "ENCERRADO")))
                        .thenReturn(tutorTemHistorico);
            }
            when(contratoRepository.save(any(ContratosEntity.class))).thenReturn(contrato);

            configurarMapperAvulso(contrato, movimentacao, agendamento, response, new BigDecimal(valor), pendente);

            AgendamentoCriadoResponse resultado = agendamentoTutorService.criarAgendamento(criarRequestAvulso(idServico, idPet, data), idTutor);

            assertNotNull(resultado);
            assertEquals(response, resultado);

            if (tutorTemHistorico == null) {
                verify(contratoRepository, never()).existsByPetFkUsuarioIdUsuarioAndSituacaoIn(any(UUID.class), anyList());
            }
            verify(contratoRepository).save(any(ContratosEntity.class));
            verify(movimentacoesRepository).save(any(MovimentacoesEntity.class));
            verify(agendamentoRepository).save(any(AgendamentosEntity.class));
        }

        @Test
        @DisplayName("Deve criar contrato de Dayuse ativo quando tutor já possui histórico comercial")
        void deveCriarContratoAtivoQuandoTutorJaPossuiHistorico() {
            criarAvulsoEVerificar(1, "DAYUSE", "90.00", true, false);
        }

        @Test
        @DisplayName("Deve criar contrato de Dayuse pendente quando tutor não possui histórico comercial")
        void deveCriarContratoPendenteQuandoTutorNaoPossuiHistorico() {
            criarAvulsoEVerificar(1, "DAYUSE", "90.00", false, true);
        }

        @Nested
        @DisplayName("Testes de contratação de Hotel")
        class ContratacaoHotelTest {
            @Test
            @DisplayName("Deve manter contrato pendente mesmo quando tutor possui histórico comercial")
            void deveManterContratoPendenteQuandoTutorPossuiHistorico() {
                criarAvulsoEVerificar(2, "HOTEL", "150.00", null, true);
            }
        }

        @Nested
        @DisplayName("Testes de contratação de Plano Creche")
        class ContratacaoPlanoTest {
            private final UUID idTutor = UUID.randomUUID();
            private final UUID idPet = UUID.randomUUID();
            private final LocalDate inicio = LocalDate.now().plusDays(5);
            private final LocalDate fim = inicio.plusMonths(1).minusDays(1);
            private final PetsEntity pet = criarPet(idPet, "Rex");
            private final ServicosEntity servico = criarServico(3, "CRECHE", "PLANO", "300.00", "3");
            private final OrcamentoRequest request = criarRequestPlano(
                    3,
                    List.of(idPet),
                    inicio,
                    List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA)
            );

            @Test
            @DisplayName("Deve criar contrato pendente e registrar os dias da semana")
            void deveCriarContratoPendenteERegistrarDiasDaSemana() {
                ContratosEntity contrato = mock(ContratosEntity.class);
                MovimentacoesEntity movimentacao = mock(MovimentacoesEntity.class);
                AgendamentoCriadoResponse response = mock(AgendamentoCriadoResponse.class);

                prepararServicoEPet(servico, idTutor, pet);
                when(contratoRepository.existePlanoSobreposto(idPet, inicio, fim)).thenReturn(false);
                when(contratoRepository.save(any(ContratosEntity.class))).thenReturn(contrato);

                configurarMapperContratoEMovimentacao(contrato, movimentacao);
                mapper.when(() -> AgendamentoMapper.paraAgendamentoCriadoResponse(new BigDecimal("300.00"), true))
                        .thenReturn(response);

                AgendamentoCriadoResponse resultado = agendamentoTutorService.criarAgendamento(request, idTutor);

                assertNotNull(resultado);
                assertEquals(response, resultado);

                verify(contratoRepository).save(any(ContratosEntity.class));
                verify(movimentacoesRepository).save(any(MovimentacoesEntity.class));
                verify(contratoDiasSemanaRepository, times(3)).save(any(ContratoDiasSemanaEntity.class));
                verify(agendamentoRepository, never()).save(any(AgendamentosEntity.class));
            }

            @Test
            @DisplayName("Deve lançar exceção quando pet já possui plano no período")
            void deveLancarExceptionQuandoPetPossuiPlanoSobreposto() {
                prepararServicoEPet(servico, idTutor, pet);
                when(contratoRepository.existePlanoSobreposto(idPet, inicio, fim)).thenReturn(true);

                PetPossuiPlanoException exception = assertThrows(PetPossuiPlanoException.class,
                        () -> agendamentoTutorService.criarAgendamento(request, idTutor));

                assertEquals("Rex já possui um plano nesse período", exception.getMessage());

                verify(contratoRepository, never()).save(any(ContratosEntity.class));
                verify(movimentacoesRepository, never()).save(any(MovimentacoesEntity.class));
                verify(contratoDiasSemanaRepository, never()).save(any(ContratoDiasSemanaEntity.class));
            }
        }

        // Métodos auxiliares de preparação do mapper e da disponibilidade

        private void configurarMapperContratoEMovimentacao(ContratosEntity contrato, MovimentacoesEntity movimentacao) {
            mapper.when(() -> AgendamentoMapper.paraEntity(
                    any(PetsEntity.class),
                    any(ServicosEntity.class),
                    anyList(),
                    any(BigDecimal.class),
                    anyString()
            )).thenReturn(contrato);

            mapper.when(() -> AgendamentoMapper.paraEntity(
                    any(ContratosEntity.class),
                    any(BigDecimal.class)
            )).thenReturn(movimentacao);
        }

        private void configurarMapperAvulso(
                ContratosEntity contrato,
                MovimentacoesEntity movimentacao,
                AgendamentosEntity agendamento,
                AgendamentoCriadoResponse response,
                BigDecimal valorTotal,
                boolean pendente
        ) {
            configurarMapperContratoEMovimentacao(contrato, movimentacao);

            mapper.when(() -> AgendamentoMapper.paraEntity(
                    any(PetsEntity.class),
                    any(CalendarioEntity.class),
                    any(LocalDate.class),
                    anyString(),
                    any(SituacaoAgendamento.class)
            )).thenReturn(agendamento);

            mapper.when(() -> AgendamentoMapper.paraAgendamentoCriadoResponse(valorTotal, pendente))
                    .thenReturn(response);
        }

        private void prepararDisponibilidade(String categoria, LocalDate data) {
            CalendarioEntity calendario = criarCalendarioCreche(data, 10);
            calendario.setVagasHotel(10);

            when(agendamentoRepository.buscarAgendamentoPorServico(
                    eq(categoria), any(LocalDateTime.class), any(LocalDateTime.class)
            )).thenReturn(List.of());

            when(calendarioRepository.buscarCalendario(data, data)).thenReturn(List.of(calendario));
            when(calendarioRepository.findByData(data)).thenReturn(Optional.of(calendario));

            when(agendamentoRepository.petJaAgendado(
                    any(UUID.class), any(LocalDateTime.class), any(LocalDateTime.class)
            )).thenReturn(false);
        }
    }
}