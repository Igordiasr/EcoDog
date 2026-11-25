package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TutorDTO.request.*;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorServiceTest {
    @Mock
    private PetRepository petRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private MedicacoesDoPetRepository medicacoesDoPetRepository;
    @Mock
    private VacinasDoPetRepository vacinasDoPetRepository;
    @Mock
    private AlergiasDoPetRepository alergiasDoPetRepository;
    @Mock
    private AlergiasRepository alergiasRepository;
    @Mock
    private VacinasRepository vacinasRepository;
    @Mock
    private MedicacoesRepository medicacoesRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private ContratoDiasSemanaRepository contratoDiasSemanaRepository;

    @InjectMocks
    private TutorService tutorService;

    // Métodos auxiliares
    private CadastroTutorRequest criarCadastroTutorRequest() {
        return new CadastroTutorRequest(
                "João",
                "Silva",
                "14816546081",
                "11912345678",
                "tutor@example.com",
                "senha123",
                criarEnderecoRequest()
        );
    }

    private EnderecoRequest criarEnderecoRequest() {
        return new EnderecoRequest(
                "Rua das Flores",
                "123",
                "Casa 2",
                "Centro",
                "São Paulo",
                "12345678"
        );
    }

    private AtualizarSenhaRequest criarAtualizarSenhaRequest() {
        return new AtualizarSenhaRequest(
                "senha123",
                "novaSenha123"
        );
    }

    private AtualizarDadosRequest criarAtualizarDadosRequest() {
        return new AtualizarDadosRequest(
                "João",
                "Silva",
                "11912345678",
                "novoemail@example.com",
                "14816546081",
                criarEnderecoRequest()
        );
    }

    private CadastroPetRequest criarCadastroPetRequest() {
        return new CadastroPetRequest(
                "Rex",
                "Labrador",
                "M",
                true,
                LocalDate.of(2020, 5, 10),
                "Pet dócil",
                "Sociável",
                "Dr. Carlos",
                "11999999999",
                true,
                List.of(criarCadastroVacinaPetRequest()),
                List.of(criarCadastroAlergiaPetRequest()),
                List.of(criarCadastroMedicacaoPetRequest())
        );
    }

    private CadastroVacinaPetRequest criarCadastroVacinaPetRequest() {
        return new CadastroVacinaPetRequest(
                1,
                LocalDate.now().minusDays(10),
                LocalDate.now().plusDays(365)
        );
    }

    private CadastroAlergiaPetRequest criarCadastroAlergiaPetRequest() {
        return new CadastroAlergiaPetRequest(1);
    }

    private CadastroMedicacaoPetRequest criarCadastroMedicacaoPetRequest() {
        return new CadastroMedicacaoPetRequest(
                1L,
                "A cada 12 horas",
                "1 comprimido",
                true
        );
    }

    private List<VacinasEntity> criarVacinasDoRequest(CadastroPetRequest request) {
        VacinasEntity vacina = new VacinasEntity();
        vacina.setIdVacinas(request.vacinasDoPet().get(0).idVacina());

        return List.of(vacina);
    }

    private List<AlergiasEntity> criarAlergiasDoRequest(CadastroPetRequest request) {
        AlergiasEntity alergia = new AlergiasEntity();
        alergia.setIdAlergias(request.alergiasDoPet().get(0).idAlergia());

        return List.of(alergia);
    }

    private List<MedicacoesEntity> criarMedicacoesDoRequest(CadastroPetRequest request) {
        MedicacoesEntity medicacao = new MedicacoesEntity();
        medicacao.setIdMedicacoes(request.medicacoesDoPet().get(0).idMedicacao());

        return List.of(medicacao);
    }

    @Nested
    @DisplayName("Testes do método cadastrarTutor")
    class CadastrarTutorTest {
        @Test
        @DisplayName("Deve cadastrar tutor quando os dados forem válidos")
        void deveCadastrarTutorQuandoDadosForemValidos() {
            CadastroTutorRequest request = criarCadastroTutorRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
            when(usuarioRepository.existsByCpf(request.cpf())).thenReturn(false);
            when(passwordEncoder.encode(request.senha())).thenReturn("senhaCriptografada");
            when(usuarioRepository.save(any(UsuariosEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            TutorCadastroResponse response = tutorService.cadastrarTutor(request);assertNotNull(response);

            verify(usuarioRepository).existsByEmail(request.email());
            verify(usuarioRepository).existsByCpf(request.cpf());
            verify(passwordEncoder).encode(request.senha());
            verify(usuarioRepository).save(any(UsuariosEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando o e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaEstiverCadastrado() {
            CadastroTutorRequest request = criarCadastroTutorRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(true);

            assertThrows(DadoJaCadastradoException.class, () -> tutorService.cadastrarTutor(request));

            verify(usuarioRepository).existsByEmail(request.email());
            verify(usuarioRepository, never()).existsByCpf(anyString());
            verify(passwordEncoder, never()).encode(anyString());
            verify(usuarioRepository, never()).save(any(UsuariosEntity.class));
        }
    }

    @Nested
    @DisplayName("Testes do método buscarDados")
    class BuscarDadosTest {
        @Test
        @DisplayName("Deve retornar os dados do tutor quando ele existir")
        void deveRetornarDadosDoTutorQuandoEleExistir() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));

            MeusDadosResponse response = tutorService.buscarDados(idTutor);

            assertNotNull(response);
            verify(usuarioRepository).findById(idTutor);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o tutor não for encontrado")
        void deveLancarExcecaoQuandoTutorNaoForEncontrado() {
            UUID idTutor = UUID.randomUUID();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.empty());

            assertThrows(TutorNaoEncontradoException.class, () -> tutorService.buscarDados(idTutor));
            verify(usuarioRepository).findById(idTutor);
        }
    }

    @Nested
    @DisplayName("Testes do método atualizarDados")
    class AtualizarDadosTest {
        @Test
        @DisplayName("Deve atualizar os dados do tutor com sucesso")
        void deveAtualizarDadosDoTutorComSucesso() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            AtualizarDadosRequest request = criarAtualizarDadosRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), idTutor)).thenReturn(false);
            when(usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), idTutor)).thenReturn(false);
            when(usuarioRepository.save(any(UsuariosEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MeusDadosResponse response = tutorService.atualizarDados(idTutor, request);

            assertNotNull(response);
            verify(usuarioRepository).findById(idTutor);
            verify(usuarioRepository).existsByEmailAndIdUsuarioNot(request.email(), idTutor);
            verify(usuarioRepository).existsByCpfAndIdUsuarioNot(request.cpf(), idTutor);
            verify(usuarioRepository).save(any(UsuariosEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando o CPF já estiver cadastrado")
        void deveLancarExcecaoQuandoCpfJaEstiverCadastrado() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            AtualizarDadosRequest request = criarAtualizarDadosRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), idTutor)).thenReturn(false);
            when(usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), idTutor)).thenReturn(true);

            assertThrows(DadoJaCadastradoException.class, () -> tutorService.atualizarDados(idTutor, request));

            verify(usuarioRepository).existsByEmailAndIdUsuarioNot(request.email(), idTutor);
            verify(usuarioRepository).existsByCpfAndIdUsuarioNot(request.cpf(), idTutor);
            verify(usuarioRepository, never()).save(any(UsuariosEntity.class));
        }
    }

    @Nested
    @DisplayName("Testes do método atualizarSenha")
    class AtualizarSenhaTest {
        @Test
        @DisplayName("Deve atualizar a senha quando a senha atual estiver correta")
        void deveAtualizarSenhaQuandoSenhaAtualEstiverCorreta() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);
            tutor.setSenha("senhaAntigaCriptografada");

            AtualizarSenhaRequest request = new AtualizarSenhaRequest(
                    "senhaAntiga",
                    "novaSenha123"
            );

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(passwordEncoder.matches(request.senhaAtual(), tutor.getSenha())).thenReturn(true);
            when(passwordEncoder.encode(request.novaSenha())).thenReturn("novaSenhaCriptografada");
            when(usuarioRepository.save(any(UsuariosEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            tutorService.atualizarSenha(idTutor, request);

            assertEquals("novaSenhaCriptografada", tutor.getSenha());

            verify(passwordEncoder).matches(request.senhaAtual(), "senhaAntigaCriptografada");
            verify(passwordEncoder).encode(request.novaSenha());
            verify(usuarioRepository).save(tutor);
        }

        @Test
        @DisplayName("Deve lançar exceção quando a senha atual estiver incorreta")
        void deveLancarExcecaoQuandoSenhaAtualEstiverIncorreta() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);
            tutor.setSenha("senhaAntigaCriptografada");

            AtualizarSenhaRequest request = new AtualizarSenhaRequest(
                    "senhaIncorreta",
                    "novaSenha123"
            );

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(passwordEncoder.matches(request.senhaAtual(), tutor.getSenha())).thenReturn(false);

            assertThrows(DadoInvalidoException.class, () -> tutorService.atualizarSenha(idTutor, request));

            verify(passwordEncoder).matches(request.senhaAtual(), tutor.getSenha());
            verify(passwordEncoder, never()).encode(anyString());
            verify(usuarioRepository, never()).save(any(UsuariosEntity.class));
        }
    }

    @Nested
    @DisplayName("Testes do método cadastrarNovoPet")
    class CadastrarNovoPetTest {
        @Test
        @DisplayName("Deve cadastrar um novo pet com sucesso")
        void deveCadastrarNovoPetComSucesso() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            CadastroPetRequest request = criarCadastroPetRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.existsByFkUsuarioAndNome(tutor, request.nome())).thenReturn(false);
            when(vacinasRepository.findAllById(anyList())).thenReturn(criarVacinasDoRequest(request));
            when(alergiasRepository.findAllById(anyList())).thenReturn(criarAlergiasDoRequest(request));
            when(medicacoesRepository.findAllById(anyList())).thenReturn(criarMedicacoesDoRequest(request));
            when(petRepository.save(any(PetsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            CadastroPetResponse response = tutorService.cadastrarNovoPet(request, idTutor);

            assertNotNull(response);

            verify(petRepository).save(any(PetsEntity.class));
            verify(vacinasDoPetRepository).saveAll(anyList());
            verify(alergiasDoPetRepository).saveAll(anyList());
            verify(medicacoesDoPetRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o pet já estiver cadastrado")
        void deveLancarExcecaoQuandoPetJaEstiverCadastrado() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            CadastroPetRequest request = criarCadastroPetRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.existsByFkUsuarioAndNome(tutor, request.nome())).thenReturn(true);

            assertThrows(ConflitoAoCadastrarException.class, () -> tutorService.cadastrarNovoPet(request, idTutor));

            verify(petRepository).existsByFkUsuarioAndNome(tutor, request.nome());
            verify(vacinasRepository, never()).findAllById(anyList());
            verify(alergiasRepository, never()).findAllById(anyList());
            verify(medicacoesRepository, never()).findAllById(anyList());
            verify(petRepository, never()).save(any(PetsEntity.class));
        }
    }

    @Nested
    @DisplayName("Testes do método atualizarDadosPet")
    class AtualizarDadosPetTest {
        @Test
        @DisplayName("Deve atualizar os dados do pet com sucesso")
        void deveAtualizarDadosDoPetComSucesso() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            PetsEntity pet = new PetsEntity();
            pet.setIdPet(idPet);
            pet.setFkUsuario(tutor);

            CadastroPetRequest request = criarCadastroPetRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.findById(idPet)).thenReturn(Optional.of(pet));
            when(petRepository.existsByFkUsuarioAndNomeAndIdPetNot(tutor, request.nome(), idPet)).thenReturn(false);
            when(alergiasRepository.findAllById(anyList())).thenReturn(criarAlergiasDoRequest(request));
            when(vacinasRepository.findAllById(anyList())).thenReturn(criarVacinasDoRequest(request));
            when(medicacoesRepository.findAllById(anyList())).thenReturn(criarMedicacoesDoRequest(request));
            when(petRepository.save(any(PetsEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

            CadastroPetResponse response = tutorService.atualizarDadosPet(idTutor, idPet, request);

            assertNotNull(response);

            verify(petRepository).findById(idPet);
            verify(petRepository).save(any(PetsEntity.class));
            verify(alergiasRepository).findAllById(anyList());
            verify(vacinasRepository).findAllById(anyList());
            verify(medicacoesRepository).findAllById(anyList());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o pet não for encontrado")
        void deveLancarExcecaoQuandoPetNaoForEncontrado() {

            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.findById(idPet)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> tutorService.atualizarDadosPet(
                    idTutor, idPet, criarCadastroPetRequest()));

            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());

            verify(petRepository, never()).save(any(PetsEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando já existir outro pet com o mesmo nome")
        void deveLancarExcecaoQuandoJaExistirOutroPetComMesmoNome() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            PetsEntity pet = new PetsEntity();
            pet.setIdPet(idPet);
            pet.setFkUsuario(tutor);

            CadastroPetRequest request = criarCadastroPetRequest();

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.findById(idPet)).thenReturn(Optional.of(pet));
            when(petRepository.existsByFkUsuarioAndNomeAndIdPetNot(tutor, request.nome(), idPet)).thenReturn(true);

            assertThrows(ConflitoAoCadastrarException.class, () -> tutorService.atualizarDadosPet(idTutor, idPet, request));

            verify(petRepository).existsByFkUsuarioAndNomeAndIdPetNot(tutor, request.nome(), idPet);
            verify(petRepository, never()).save(any(PetsEntity.class));
        }
    }

    @Nested
    @DisplayName("Testes do método listarPets")
    class ListarPetsTest {
        @Test
        @DisplayName("Deve retornar os pets cadastrados do tutor")
        void deveRetornarPetsDoTutor() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            PetsEntity pet = new PetsEntity();
            pet.setNome("Rex");
            pet.setFkUsuario(tutor);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.findByFkUsuario(tutor)).thenReturn(List.of(pet));

            List<PetParaListaResponse> response = tutorService.listarPets(idTutor);

            assertNotNull(response);
            assertEquals(1, response.size());

            verify(usuarioRepository).findById(idTutor);
            verify(petRepository).findByFkUsuario(tutor);
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando o tutor não possuir pets")
        void deveRetornarListaVaziaQuandoTutorNaoPossuirPets() {
            UUID idTutor = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.findByFkUsuario(tutor)).thenReturn(List.of());

            List<PetParaListaResponse> response = tutorService.listarPets(idTutor);

            assertNotNull(response);
            assertTrue(response.isEmpty());

            verify(usuarioRepository).findById(idTutor);
            verify(petRepository).findByFkUsuario(tutor);
        }
    }

    @Nested
    @DisplayName("Testes do método excluir")
    class ExcluirTest {
        @Test
        @DisplayName("Deve excluir o pet quando ele pertencer ao tutor")
        void deveExcluirPetQuandoPertencerAoTutor() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.existsByIdPetAndFkUsuario(idPet, tutor)).thenReturn(true);

            tutorService.excluir(idTutor, idPet);

            verify(usuarioRepository).findById(idTutor);
            verify(petRepository).existsByIdPetAndFkUsuario(idPet, tutor);
            verify(petRepository).deleteById(idPet);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o pet não pertencer ao tutor")
        void deveLancarExcecaoQuandoPetNaoPertencerAoTutor() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            UsuariosEntity tutor = new UsuariosEntity();
            tutor.setIdUsuario(idTutor);
            tutor.setTipo(TipoUsuario.TUTOR);

            when(usuarioRepository.findById(idTutor)).thenReturn(Optional.of(tutor));
            when(petRepository.existsByIdPetAndFkUsuario(idPet, tutor)).thenReturn(false);

            assertThrows(DadosDivergentesException.class, () -> tutorService.excluir(idTutor, idPet));

            verify(petRepository).existsByIdPetAndFkUsuario(idPet, tutor);
            verify(petRepository, never()).deleteById(any(UUID.class));
        }
    }

    @Nested
    @DisplayName("Testes do método buscarAgendamentos")
    class BuscarAgendamentosTest {
        @Test
        @DisplayName("Deve retornar lista vazia quando o tutor não possuir agendamentos")
        void deveRetornarListaVaziaQuandoNaoHouverAgendamentos() {
            UUID idTutor = UUID.randomUUID();

            when(agendamentoRepository.buscarAgendamentosDoTutor(idTutor)).thenReturn(List.of());

            List<MeusAgendamentosResponse> response = tutorService.buscarAgendamentos(idTutor);

            assertNotNull(response);
            assertTrue(response.isEmpty());

            verify(agendamentoRepository).buscarAgendamentosDoTutor(idTutor);
            verifyNoInteractions(contratoDiasSemanaRepository);
        }

        @Test
        @DisplayName("Deve agrupar agendamentos do mesmo pet e serviço")
        void deveAgruparAgendamentosDoMesmoPetEServico() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            PetsEntity pet = new PetsEntity();
            pet.setIdPet(idPet);
            pet.setNome("Rex");

            AgendamentosEntity agendamento1 = new AgendamentosEntity();
            agendamento1.setFkPet(pet);
            agendamento1.setServico("HOTEL");
            agendamento1.setDataEntrada(LocalDateTime.of(2026, 11, 20, 8, 0));

            AgendamentosEntity agendamento2 = new AgendamentosEntity();
            agendamento2.setFkPet(pet);
            agendamento2.setServico("HOTEL");
            agendamento2.setDataEntrada(LocalDateTime.of(2026, 11, 21, 8, 0));

            when(agendamentoRepository.buscarAgendamentosDoTutor(idTutor)).thenReturn(List.of(agendamento1, agendamento2));

            List<MeusAgendamentosResponse> response = tutorService.buscarAgendamentos(idTutor);

            assertNotNull(response);
            assertEquals(1, response.size());

            verify(agendamentoRepository).buscarAgendamentosDoTutor(idTutor);
            verifyNoInteractions(contratoDiasSemanaRepository);
        }

        @Test
        @DisplayName("Deve buscar os dias da semana do contrato quando o serviço for Creche")
        void deveBuscarDiasDaSemanaQuandoServicoForCreche() {
            UUID idTutor = UUID.randomUUID();
            UUID idPet = UUID.randomUUID();

            PetsEntity pet = new PetsEntity();
            pet.setIdPet(idPet);
            pet.setNome("Rex");

            AgendamentosEntity agendamento = new AgendamentosEntity();
            agendamento.setFkPet(pet);
            agendamento.setServico("CRECHE");
            agendamento.setDataEntrada(LocalDateTime.of(2026, 11, 20, 8, 0));

            List<DiaSemana> diasSemana = List.of(DiaSemana.SEGUNDA, DiaSemana.QUARTA, DiaSemana.SEXTA);

            when(agendamentoRepository.buscarAgendamentosDoTutor(idTutor)).thenReturn(List.of(agendamento));
            when(contratoDiasSemanaRepository.buscarDiasDaSemanaCrechePorPet(eq(idPet), any(LocalDate.class))).thenReturn(diasSemana);

            List<MeusAgendamentosResponse> response = tutorService.buscarAgendamentos(idTutor);

            assertNotNull(response);
            assertEquals(1, response.size());

            verify(contratoDiasSemanaRepository).buscarDiasDaSemanaCrechePorPet(
                    eq(idPet), any(LocalDate.class));
        }
    }
}