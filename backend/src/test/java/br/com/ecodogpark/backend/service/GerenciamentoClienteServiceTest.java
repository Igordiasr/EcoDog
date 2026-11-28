package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AlterarStatusContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.AtualizarValorContratoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.request.VincularPlanoRequest;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.ContratoGerenciamentoResponse;
import br.com.ecodogpark.backend.dto.GerenciamentoClienteDTO.response.VincularPlanoResponse;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.DiaSemana;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.*;
import br.com.ecodogpark.backend.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do Gerenciamento de Clientes")
public class GerenciamentoClienteServiceTest {
    @Mock
    private ContratoRepository contratoRepository;

    @Mock
    private ContratoDiasSemanaRepository contratoDiasSemanaRepository;

    @Mock
    private ServicosRepository servicosRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private CalendarioRepository calendarioRepository;

    @Mock
    private MovimentacoesRepository movimentacoesRepository;

    @InjectMocks
    private GerenciamentoClienteService gerenciamentoClienteService;

    private PetsEntity criarPet() {
        UsuariosEntity tutor = new UsuariosEntity();
        tutor.setIdUsuario(UUID.randomUUID());
        tutor.setNome("Maria");
        tutor.setSobrenome("Silva");

        PetsEntity pet = new PetsEntity();
        pet.setIdPet(UUID.randomUUID());
        pet.setNome("Rex");
        pet.setFkUsuario(tutor);

        return pet;
    }

    private ServicosEntity criarServico() {
        ServicosEntity servico = new ServicosEntity();
        servico.setIdServico(1);
        servico.setNome("Creche");
        servico.setCategoria("CRECHE");
        servico.setModalidade("PLANO");
        servico.setFrequencia("3");
        servico.setValor(new BigDecimal("500.00"));
        servico.setStatus(true);

        return servico;
    }

    private ContratosEntity criarContrato(PetsEntity pet) {
        ContratosEntity contrato = new ContratosEntity();
        contrato.setIdContrato(1L);
        contrato.setPet(pet);
        contrato.setServicos(criarServico());
        contrato.setValor(new BigDecimal("500.00"));
        contrato.setSituacao("ATIVO");

        return contrato;
    }

    private VincularPlanoRequest criarRequestVincularPlano(
            PetsEntity pet,
            ServicosEntity servico,
            LocalDate dataInicio,
            LocalDate dataFim,
            List<DiaSemana> diasSemana
    ) {
        return new VincularPlanoRequest(
                pet.getFkUsuario().getIdUsuario(),
                pet.getIdPet(),
                servico.getIdServico(),
                new BigDecimal("500.00"),
                diasSemana,
                dataInicio,
                dataFim
        );
    }

    private void prepararDadosVincularPlano(
            PetsEntity pet,
            UsuariosEntity tutor,
            ServicosEntity servico
    ) {
        CalendarioEntity calendario = new CalendarioEntity();
        calendario.setVagasCreche(100);
        calendario.setVagasHotel(100);

        when(usuarioRepository.findById(tutor.getIdUsuario()))
                .thenReturn(Optional.of(tutor));

        when(petRepository.findById(pet.getIdPet()))
                .thenReturn(Optional.of(pet));

        when(servicosRepository.findById(servico.getIdServico()))
                .thenReturn(Optional.of(servico));

        when(contratoRepository.save(any(ContratosEntity.class)))
                .thenAnswer(invocation -> {
                    ContratosEntity contrato = invocation.getArgument(0);
                    contrato.setIdContrato(1L);
                    return contrato;
                });

        when(calendarioRepository.findByData(any(LocalDate.class)))
                .thenReturn(Optional.of(calendario));
    }

    @Nested
    @DisplayName("buscarContratos")
    class BuscarContratos {

        @Test
        @DisplayName("Deve retornar lista vazia quando não encontrar tutores")
        void deveRetornarListaVaziaQuandoNaoEncontrarTutores() {
            Pageable pageable = PageRequest.of(0, 20);

            when(petRepository.buscarIdsTutoresParaGerenciamento("Rex", TipoUsuario.TUTOR, pageable))
                    .thenReturn(Page.empty());

            var resultado = gerenciamentoClienteService.buscarContratos("Rex", 0);

            assertTrue(resultado.isEmpty());

            verify(petRepository).buscarIdsTutoresParaGerenciamento("Rex", TipoUsuario.TUTOR, pageable);
            verifyNoInteractions(contratoRepository);
            verifyNoInteractions(contratoDiasSemanaRepository);
        }

        @Test
        @DisplayName("Deve retornar pets sem contratos")
        void deveRetornarPetsSemContratos() {
            PetsEntity pet = criarPet();

            UUID idTutor = pet.getFkUsuario().getIdUsuario();
            Pageable pageable = PageRequest.of(0, 20);

            when(petRepository.buscarIdsTutoresParaGerenciamento(null, TipoUsuario.TUTOR, pageable))
                    .thenReturn(new PageImpl<>(List.of(idTutor)));

            when(petRepository.buscarPetsDosTutores(List.of(idTutor)))
                    .thenReturn(List.of(pet));

            when(contratoRepository.buscarContratosDosPetsParaGerenciamento(List.of(pet.getIdPet())))
                    .thenReturn(List.of());

            var resultado = gerenciamentoClienteService.buscarContratos(null, 0);

            assertEquals(1, resultado.size());
            assertEquals(pet.getIdPet(), resultado.get(0).idPet());
            assertEquals("Rex", resultado.get(0).nomePet());
            assertEquals("Maria Silva", resultado.get(0).tutor());
            assertEquals(0, resultado.get(0).totalContratos());
            assertTrue(resultado.get(0).contratos().isEmpty());

            verify(petRepository).buscarIdsTutoresParaGerenciamento(null, TipoUsuario.TUTOR, pageable);
            verify(petRepository).buscarPetsDosTutores(List.of(idTutor));
            verify(contratoRepository).buscarContratosDosPetsParaGerenciamento(List.of(pet.getIdPet()));
            verifyNoInteractions(contratoDiasSemanaRepository);
        }

        @Test
        @DisplayName("Deve retornar pets com seus contratos")
        void deveRetornarPetsComContratos() {
            PetsEntity pet = criarPet();
            ContratosEntity contrato = criarContrato(pet);

            UUID idTutor = pet.getFkUsuario().getIdUsuario();
            Pageable pageable = PageRequest.of(0, 20);

            ContratoDiasSemanaEntity dia = new ContratoDiasSemanaEntity();
            dia.setContrato(contrato);
            dia.setDiaSemana(DiaSemana.SEGUNDA);

            when(petRepository.buscarIdsTutoresParaGerenciamento(null, TipoUsuario.TUTOR, pageable))
                    .thenReturn(new PageImpl<>(List.of(idTutor)));

            when(petRepository.buscarPetsDosTutores(List.of(idTutor)))
                    .thenReturn(List.of(pet));

            when(contratoRepository.buscarContratosDosPetsParaGerenciamento(List.of(pet.getIdPet())))
                    .thenReturn(List.of(contrato));

            when(contratoDiasSemanaRepository.findByContrato_idContratoIn(List.of(1L)))
                    .thenReturn(List.of(dia));

            when(contratoRepository.contarDiariasPorContrato(List.of(1L)))
                    .thenReturn(List.of());

            var resultado = gerenciamentoClienteService.buscarContratos(null, 0);

            assertEquals(1, resultado.size());
            assertEquals(1, resultado.get(0).totalContratos());
            assertEquals(1, resultado.get(0).contratos().size());

            ContratoGerenciamentoResponse contratoResponse = resultado.get(0).contratos().get(0);

            assertEquals(1L, contratoResponse.idContrato());
            assertEquals("CRECHE", contratoResponse.servico());
            assertEquals(new BigDecimal("500.00"), contratoResponse.valor());
            assertEquals(List.of("SEGUNDA"), contratoResponse.diasSemana());
            assertNull(contratoResponse.quantidadeDiarias());

            verify(petRepository).buscarIdsTutoresParaGerenciamento(null, TipoUsuario.TUTOR, pageable);
            verify(petRepository).buscarPetsDosTutores(List.of(idTutor));
            verify(contratoRepository).buscarContratosDosPetsParaGerenciamento(List.of(pet.getIdPet()));
            verify(contratoDiasSemanaRepository).findByContrato_idContratoIn(List.of(1L));
            verify(contratoRepository).contarDiariasPorContrato(List.of(1L));
        }
    }

    @Nested
    @DisplayName("listarPlanos")
    class ListarPlanos {

        @Test
        @DisplayName("Deve retornar os planos disponíveis")
        void deveRetornarPlanosDisponiveis() {
            ServicosEntity servico = criarServico();

            when(servicosRepository.findByStatusTrueOrderByNomeAsc())
                    .thenReturn(List.of(servico));

            var resultado = gerenciamentoClienteService.listarPlanos();

            assertEquals(1, resultado.size());
            assertEquals(1, resultado.get(0).idServico());
            assertEquals("Creche", resultado.get(0).nome());
            assertEquals("CRECHE", resultado.get(0).categoria());

            verify(servicosRepository).findByStatusTrueOrderByNomeAsc();
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não houver planos")
        void deveRetornarListaVaziaQuandoNaoHouverPlanos() {
            when(servicosRepository.findByStatusTrueOrderByNomeAsc())
                    .thenReturn(List.of());

            var resultado = gerenciamentoClienteService.listarPlanos();

            assertTrue(resultado.isEmpty());

            verify(servicosRepository).findByStatusTrueOrderByNomeAsc();
        }
    }

    @Nested
    @DisplayName("listarTutores")
    class ListarTutores {

        @Test
        @DisplayName("Deve retornar os tutores disponíveis")
        void deveRetornarTutoresDisponiveis() {
            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(UUID.randomUUID());
            tutor.setNome("Maria");
            tutor.setSobrenome("Silva");

            when(usuarioRepository.findByTipoAndStatusUsuarioTrue(
                    TipoUsuario.TUTOR
            )).thenReturn(List.of(tutor));

            var resultado = gerenciamentoClienteService.listarTutores();

            assertEquals(1, resultado.size());
            assertEquals(tutor.getIdUsuario(), resultado.get(0).idTutor());
            assertEquals("Maria", resultado.get(0).nome());
            assertEquals("Silva", resultado.get(0).sobrenome());

            verify(usuarioRepository).findByTipoAndStatusUsuarioTrue(
                    TipoUsuario.TUTOR
            );
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não houver tutores")
        void deveRetornarListaVaziaQuandoNaoHouverTutores() {
            when(usuarioRepository.findByTipoAndStatusUsuarioTrue(
                    TipoUsuario.TUTOR
            )).thenReturn(List.of());

            var resultado = gerenciamentoClienteService.listarTutores();

            assertTrue(resultado.isEmpty());

            verify(usuarioRepository).findByTipoAndStatusUsuarioTrue(
                    TipoUsuario.TUTOR
            );
        }
    }

    @Nested
    @DisplayName("listarPetsDoTutor")
    class ListarPetsDoTutor {

        @Test
        @DisplayName("Deve retornar os pets vinculados ao tutor")
        void deveRetornarPetsDoTutor() {
            UUID idTutor = UUID.randomUUID();
            PetsEntity pet = criarPet();

            when(petRepository.findByFkUsuarioIdUsuario(idTutor))
                    .thenReturn(List.of(pet));

            var resultado = gerenciamentoClienteService.listarPetsDoTutor(idTutor);

            assertEquals(1, resultado.size());
            assertEquals(pet.getIdPet(), resultado.get(0).idPet());
            assertEquals("Rex", resultado.get(0).nome());

            verify(petRepository).findByFkUsuarioIdUsuario(idTutor);
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando tutor não possuir pets")
        void deveRetornarListaVaziaQuandoTutorNaoPossuirPets() {
            UUID idTutor = UUID.randomUUID();

            when(petRepository.findByFkUsuarioIdUsuario(idTutor))
                    .thenReturn(List.of());

            var resultado = gerenciamentoClienteService.listarPetsDoTutor(idTutor);

            assertTrue(resultado.isEmpty());

            verify(petRepository).findByFkUsuarioIdUsuario(idTutor);
        }
    }

    // ATUALIZAR CONTRATO

    @Nested
    @DisplayName("atualizarContrato")
    class AtualizarContrato {

        @Test
        @DisplayName("Deve atualizar o valor do contrato")
        void deveAtualizarValorContrato() {
            ContratosEntity contrato = criarContrato(criarPet());
            MovimentacoesEntity movimentacao = new MovimentacoesEntity();

            AtualizarValorContratoRequest request =
                    new AtualizarValorContratoRequest(new BigDecimal("700.00"));

            when(contratoRepository.findById(1L))
                    .thenReturn(Optional.of(contrato));

            when(movimentacoesRepository.findByContrato(contrato))
                    .thenReturn(Optional.of(movimentacao));

            gerenciamentoClienteService.atualizarContrato(1L, request);

            assertEquals(new BigDecimal("700.00"), contrato.getValor());
            assertEquals(new BigDecimal("700.00"), movimentacao.getValor());

            verify(contratoRepository).save(contrato);
            verify(movimentacoesRepository).save(movimentacao);
        }

        @Test
        @DisplayName("Deve lançar exceção quando contrato não existir")
        void deveLancarExcecaoQuandoContratoNaoExistir() {
            AtualizarValorContratoRequest request =
                    new AtualizarValorContratoRequest(new BigDecimal("700.00"));

            when(contratoRepository.findById(1L))
                    .thenReturn(Optional.empty());

            ContratoNaoEncontradoException exception = assertThrows(ContratoNaoEncontradoException.class,
                    () -> gerenciamentoClienteService.atualizarContrato(1L, request)
            );

            assertEquals("Contrato não encontrado", exception.getMessage());

            verify(contratoRepository).findById(1L);
            verify(contratoRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("alterarStatusContrato")
    class AlterarStatusContrato {

        @Test
        @DisplayName("Deve alterar o status do contrato")
        void deveAlterarStatusContrato() {
            ContratosEntity contrato = criarContrato(criarPet());
            AlterarStatusContratoRequest request =
                    new AlterarStatusContratoRequest("CANCELADO");

            when(contratoRepository.findById(1L))
                    .thenReturn(Optional.of(contrato));

            when(contratoRepository.save(contrato))
                    .thenReturn(contrato);

            gerenciamentoClienteService.alterarStatusContrato(1L, request);

            assertEquals("CANCELADO", contrato.getSituacao());

            verify(contratoRepository).findById(1L);
            verify(contratoRepository).save(contrato);
        }

        @Test
        @DisplayName("Deve lançar exceção quando contrato não existir")
        void deveLancarExcecaoQuandoContratoNaoExistir() {
            AlterarStatusContratoRequest request =
                    new AlterarStatusContratoRequest("CANCELADO");

            when(contratoRepository.findById(1L))
                    .thenReturn(Optional.empty());

            ContratoNaoEncontradoException exception = assertThrows(
                    ContratoNaoEncontradoException.class,
                    () -> gerenciamentoClienteService.alterarStatusContrato(1L, request)
            );

            assertEquals("Contrato não encontrado", exception.getMessage());

            verify(contratoRepository).findById(1L);
            verify(contratoRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes de Vincular Plano")
    class VincularPlanoTest {
        @Test
        @DisplayName("Deve vincular plano Creche e gerar agendamentos")
        void deveVincularPlanoCreche() {
            PetsEntity pet = criarPet();
            UsuariosEntity tutor = pet.getFkUsuario();
            ServicosEntity servico = criarServico();

            LocalDate inicio = LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(1);

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet,
                    servico,
                    inicio,
                    null,
                    List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA)
            );

            CalendarioEntity calendario = new CalendarioEntity();
            calendario.setVagasCreche(100);
            calendario.setVagasHotel(100);

            when(usuarioRepository.findById(tutor.getIdUsuario()))
                    .thenReturn(Optional.of(tutor));

            when(petRepository.findById(pet.getIdPet()))
                    .thenReturn(Optional.of(pet));

            when(servicosRepository.findById(servico.getIdServico()))
                    .thenReturn(Optional.of(servico));

            when(contratoRepository.existePlanoAtivoOuPendente(pet.getIdPet()))
                    .thenReturn(false);

            when(contratoRepository.save(any(ContratosEntity.class))).thenAnswer(invocation -> {
                ContratosEntity contrato = invocation.getArgument(0);
                contrato.setIdContrato(1L);
                return contrato;
            });

            when(calendarioRepository.findByData(any(LocalDate.class)))
                    .thenReturn(Optional.of(calendario));

            when(agendamentoRepository.petJaAgendado(eq(pet.getIdPet()), any(LocalDateTime.class), any(LocalDateTime.class)))
                    .thenReturn(false);

            when(agendamentoRepository.contarAgendamentosPorServicoEData(eq("CRECHE"), any(LocalDate.class)))
                    .thenReturn(0L);

            VincularPlanoResponse resultado = gerenciamentoClienteService.vincularPlano(request);

            assertNotNull(resultado);

            verify(contratoRepository).save(any(ContratosEntity.class));
            verify(contratoDiasSemanaRepository).saveAll(anyList());
            verify(agendamentoRepository).saveAll(anyList());
            verify(movimentacoesRepository, never()).save(any(MovimentacoesEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando pet já possuir plano ativo ou pendente")
        void deveLancarExcecaoQuandoPetJaPossuirPlano() {
            PetsEntity pet = criarPet();
            UsuariosEntity tutor = pet.getFkUsuario();
            ServicosEntity servico = criarServico();

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet,
                    servico,
                    LocalDate.now().plusDays(1),
                    null,
                    List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA)
            );

            when(usuarioRepository.findById(tutor.getIdUsuario())).thenReturn(Optional.of(tutor));
            when(petRepository.findById(pet.getIdPet())).thenReturn(Optional.of(pet));
            when(servicosRepository.findById(servico.getIdServico())).thenReturn(Optional.of(servico));
            when(contratoRepository.existePlanoAtivoOuPendente(pet.getIdPet())).thenReturn(true);

            assertThrows(PetPossuiPlanoException.class, () -> gerenciamentoClienteService.vincularPlano(request));

            verify(contratoRepository, never()).save(any(ContratosEntity.class));
            verify(agendamentoRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Deve lançar exceção quando pet não pertencer ao tutor")
        void deveLancarExcecaoQuandoPetNaoPertencerAoTutor() {
            PetsEntity pet = criarPet();

            UsuariosEntity outroTutor = new UsuariosEntity();
            outroTutor.setIdUsuario(UUID.randomUUID());

            VincularPlanoRequest request = new VincularPlanoRequest(
                    outroTutor.getIdUsuario(),
                    pet.getIdPet(),
                    1,
                    new BigDecimal("500.00"),
                    List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA),
                    LocalDate.now().plusDays(1),
                    null
            );

            when(usuarioRepository.findById(outroTutor.getIdUsuario())).thenReturn(Optional.of(outroTutor));
            when(petRepository.findById(pet.getIdPet())).thenReturn(Optional.of(pet));

            assertThrows(PetNaoPertenceAoTutorException.class, () -> gerenciamentoClienteService.vincularPlano(request));

            verify(servicosRepository, never()).findById(anyInt());
            verify(contratoRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve vincular plano Hotel e gerar agendamentos e movimentação")
        void deveVincularPlanoHotel() {
            PetsEntity pet = criarPet();
            UsuariosEntity tutor = pet.getFkUsuario();
            ServicosEntity servico = criarServico();

            servico.setCategoria("HOTEL");
            servico.setModalidade("AVULSO");

            LocalDate inicio = LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(1);
            LocalDate fim = inicio.plusDays(2);

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet, servico, inicio, fim, null
            );

            prepararDadosVincularPlano(pet, tutor, servico);

            VincularPlanoResponse resultado = gerenciamentoClienteService.vincularPlano(request);

            assertNotNull(resultado);

            verify(contratoRepository).save(any(ContratosEntity.class));
            verify(agendamentoRepository).saveAll(anyList());
            verify(movimentacoesRepository).save(any(MovimentacoesEntity.class));
            verify(contratoDiasSemanaRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Deve lançar exceção quando pet já estiver agendado na data")
        void deveLancarExcecaoQuandoPetJaEstiverAgendado() {
            PetsEntity pet = criarPet();
            UsuariosEntity tutor = pet.getFkUsuario();
            ServicosEntity servico = criarServico();

            servico.setCategoria("HOTEL");

            LocalDate inicio = LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(1);

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet, servico, inicio, inicio.plusDays(2), null
            );

            prepararDadosVincularPlano(pet, tutor, servico);

            when(agendamentoRepository.petJaAgendado(
                    eq(pet.getIdPet()),
                    any(LocalDateTime.class),
                    any(LocalDateTime.class)
            )).thenReturn(true);

            assertThrows(
                    PetJaAgendadoException.class,
                    () -> gerenciamentoClienteService.vincularPlano(request)
            );
        }

        @Test
        @DisplayName("Deve vincular plano DayUse e gerar agendamentos e movimentação")
        void deveVincularPlanoDayUse() {
            PetsEntity pet = criarPet();
            UsuariosEntity tutor = pet.getFkUsuario();
            ServicosEntity servico = criarServico();

            servico.setCategoria("DAYUSE");
            servico.setModalidade("AVULSO");

            LocalDate inicio = LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(1);
            LocalDate fim = inicio.plusDays(2);

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet, servico, inicio, fim, null
            );

            prepararDadosVincularPlano(pet, tutor, servico);

            VincularPlanoResponse resultado = gerenciamentoClienteService.vincularPlano(request);

            assertNotNull(resultado);

            verify(contratoRepository).save(any(ContratosEntity.class));
            verify(agendamentoRepository).saveAll(anyList());
            verify(movimentacoesRepository).save(any(MovimentacoesEntity.class));
            verify(contratoDiasSemanaRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Deve lançar exceção quando data de início for nula")
        void deveLancarExcecaoQuandoDataInicioForNula() {
            PetsEntity pet = criarPet();
            ServicosEntity servico = criarServico();

            servico.setCategoria("HOTEL");

            VincularPlanoRequest request = criarRequestVincularPlano(
                    pet, servico, null, LocalDate.now().plusDays(2), null
            );

            when(usuarioRepository.findById(pet.getFkUsuario().getIdUsuario()))
                    .thenReturn(Optional.of(pet.getFkUsuario()));
            when(petRepository.findById(pet.getIdPet()))
                    .thenReturn(Optional.of(pet));
            when(servicosRepository.findById(servico.getIdServico()))
                    .thenReturn(Optional.of(servico));

            assertThrows(DataInvalidaException.class,
                    () -> gerenciamentoClienteService.vincularPlano(request));

            verify(contratoRepository, never()).save(any(ContratosEntity.class));
        }
    }
}