package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.MonitorRequest;
import br.com.ecodogpark.backend.dto.UsuarioDTO.UsuarioRequest;
import br.com.ecodogpark.backend.entity.UsuariosEntity;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.DadoJaCadastradoException;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;
import br.com.ecodogpark.backend.repository.ContratoDiasSemanaRepository;
import br.com.ecodogpark.backend.repository.ContratoRepository;
import br.com.ecodogpark.backend.repository.UsuarioRepository;
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
class UsuarioServiceTest {
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ContratoRepository contratoRepository;
    @Mock
    private ContratoDiasSemanaRepository contratoDiasSemanaRepository;
    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private UsuarioRequest criarUsuarioRequest() {
        return new UsuarioRequest(
                "João",
                "Silva",
                "joao@example.com",
                "52998224725",
                "11912345678",
                "Senha123!"
        );
    }

    private MonitorRequest criarMonitorRequest() {
        return new MonitorRequest(
                "Carlos",
                "Santos",
                "carlos@example.com",
                "16899535009",
                "11987654321",
                "Senha123!"
        );
    }

    private UsuariosEntity criarUsuario(TipoUsuario tipo) {
        UsuariosEntity usuario = new UsuariosEntity();
        usuario.setIdUsuario(UUID.randomUUID());
        usuario.setNome("João");
        usuario.setSobrenome("Silva");
        usuario.setEmail("joao@example.com");
        usuario.setCpf("52998224725");
        usuario.setTelefone("11912345678");
        usuario.setSenha("senhaCriptografada");
        usuario.setTipo(tipo);
        usuario.setStatusUsuario(true);
        usuario.setDataCadastro(LocalDate.now());

        return usuario;
    }

    private void configurarSave() {
        when(usuarioRepository.save(any(UsuariosEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private void configurarEncoder() {
        when(passwordEncoder.encode(anyString()))
                .thenReturn("senhaCriptografada");
    }

    private void verificarNotFound(ResponseStatusException exception) {
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    private void verificarConflict(ResponseStatusException exception) {
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Nested
    @DisplayName("Testes do método listarMonitores")
    class ListarMonitoresTest {
        @Test
        @DisplayName("Deve listar os monitores cadastrados")
        void deveListarMonitores() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);

            when(usuarioRepository.findByTipo(TipoUsuario.MONITOR)).thenReturn(List.of(monitor));

            var resultado = usuarioService.listarMonitores();

            assertEquals(1, resultado.size());
            assertEquals(monitor.getIdUsuario(), resultado.getFirst().id());

            verify(usuarioRepository).findByTipo(TipoUsuario.MONITOR);
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não houver monitores")
        void deveRetornarListaVazia() {
            when(usuarioRepository.findByTipo(TipoUsuario.MONITOR)).thenReturn(List.of());

            var resultado = usuarioService.listarMonitores();

            assertTrue(resultado.isEmpty());
        }
    }

    @Nested
    @DisplayName("Testes do método cadastrarMonitor")
    class CadastrarMonitorTest {
        @Test
        @DisplayName("Deve cadastrar um monitor com sucesso")
        void deveCadastrarMonitor() {
            MonitorRequest request = criarMonitorRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
            when(usuarioRepository.existsByCpf(request.cpf())).thenReturn(false);
            configurarEncoder();
            configurarSave();

            var resultado = usuarioService.cadastrarMonitor(request);

            assertNotNull(resultado);
            assertEquals(request.nome(), resultado.nome());
            assertEquals(request.email(), resultado.email());

            verify(usuarioRepository).save(any(UsuariosEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando o e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaCadastrado() {
            MonitorRequest request = criarMonitorRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(true);

            assertThrows(DadoJaCadastradoException.class, () -> usuarioService.cadastrarMonitor(request));

            verify(usuarioRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes do método buscarMonitorPorId")
    class BuscarMonitorPorIdTest {
        @Test
        @DisplayName("Deve buscar um monitor pelo ID")
        void deveBuscarMonitorPorId() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);

            when(usuarioRepository.findById(monitor.getIdUsuario())).thenReturn(Optional.of(monitor));

            var resultado = usuarioService.buscarMonitorPorId(monitor.getIdUsuario());

            assertNotNull(resultado);
            assertEquals(monitor.getIdUsuario(), resultado.id());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o monitor não existir")
        void deveLancarExcecaoQuandoMonitorNaoExistir() {
            UUID id = UUID.randomUUID();

            when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.buscarMonitorPorId(id));

            verificarNotFound(exception);
        }
    }

    @Nested
    @DisplayName("Testes do método atualizarMonitor")
    class AtualizarMonitorTest {
        @Test
        @DisplayName("Deve atualizar um monitor com sucesso")
        void deveAtualizarMonitor() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);
            MonitorRequest request = criarMonitorRequest();

            when(usuarioRepository.findById(monitor.getIdUsuario())).thenReturn(Optional.of(monitor));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), monitor.getIdUsuario())).thenReturn(false);
            when(usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), monitor.getIdUsuario())).thenReturn(false);

            configurarEncoder();
            configurarSave();

            var resultado = usuarioService.atualizarMonitor(monitor.getIdUsuario(), request);

            assertEquals(request.nome(), resultado.nome());
            assertEquals(request.email(), resultado.email());

            verify(usuarioRepository).save(monitor);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o novo e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaCadastrado() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);
            MonitorRequest request = criarMonitorRequest();

            when(usuarioRepository.findById(monitor.getIdUsuario())).thenReturn(Optional.of(monitor));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), monitor.getIdUsuario())).thenReturn(true);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.atualizarMonitor(monitor.getIdUsuario(), request));

            verificarConflict(exception);
            verify(usuarioRepository, never()).save(any());
        }

    }

    @Nested
    @DisplayName("Testes do método excluirMonitor")
    class ExcluirMonitorTest {

        @Test
        @DisplayName("Deve excluir um monitor com sucesso")
        void deveExcluirMonitor() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);

            when(usuarioRepository.findById(monitor.getIdUsuario())).thenReturn(Optional.of(monitor));

            usuarioService.excluirMonitor(monitor.getIdUsuario());

            assertFalse(monitor.getStatusUsuario());

            verify(usuarioRepository).save(monitor);
            verify(usuarioRepository).deleteById(monitor.getIdUsuario());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o monitor não existir")
        void deveLancarExcecaoQuandoMonitorNaoExistir() {
            UUID id = UUID.randomUUID();

            when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.excluirMonitor(id));

            verificarNotFound(exception);

            verify(usuarioRepository, never()).save(any());
            verify(usuarioRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("Testes do método listarAdministradores")
    class ListarAdministradoresTest {

        @Test
        @DisplayName("Deve listar os administradores cadastrados")
        void deveListarAdministradores() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);

            when(usuarioRepository.findByTipo(TipoUsuario.ADMINISTRADOR)).thenReturn(List.of(administrador));

            var resultado = usuarioService.listarAdministradores();

            assertEquals(1, resultado.size());
            assertEquals(administrador.getIdUsuario(), resultado.getFirst().id());

            verify(usuarioRepository).findByTipo(TipoUsuario.ADMINISTRADOR);
        }

        @Test
        @DisplayName("Deve retornar lista vazia quando não houver administradores")
        void deveRetornarListaVazia() {
            when(usuarioRepository.findByTipo(TipoUsuario.ADMINISTRADOR)).thenReturn(List.of());

            var resultado = usuarioService.listarAdministradores();

            assertTrue(resultado.isEmpty());
        }
    }

    @Nested
    @DisplayName("Testes do método cadastrarAdministrador")
    class CadastrarAdministradorTest {

        @Test
        @DisplayName("Deve cadastrar um administrador com sucesso")
        void deveCadastrarAdministrador() {
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
            when(usuarioRepository.existsByCpf(request.cpf())).thenReturn(false);

            configurarEncoder();
            configurarSave();

            var resultado = usuarioService.cadastrarAdministrador(request);

            assertNotNull(resultado);
            assertEquals(request.nome(), resultado.nome());
            assertEquals(request.email(), resultado.email());

            verify(usuarioRepository).save(any(UsuariosEntity.class));
        }

        @Test
        @DisplayName("Deve lançar exceção quando o e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaCadastrado() {
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(true);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.cadastrarAdministrador(request));

            verificarConflict(exception);
            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o CPF já estiver cadastrado")
        void deveLancarExcecaoQuandoCpfJaCadastrado() {
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.existsByEmail(request.email())).thenReturn(false);
            when(usuarioRepository.existsByCpf(request.cpf())).thenReturn(true);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.cadastrarAdministrador(request));

            verificarConflict(exception);
            verify(usuarioRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes do método buscarAdministradorPorId")
    class BuscarAdministradorPorIdTest {

        @Test
        @DisplayName("Deve buscar um administrador pelo ID")
        void deveBuscarAdministradorPorId() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);

            when(usuarioRepository.findById(administrador.getIdUsuario())).thenReturn(Optional.of(administrador));

            var resultado = usuarioService.buscarAdministradorPorId(administrador.getIdUsuario());

            assertNotNull(resultado);
            assertEquals(administrador.getIdUsuario(), resultado.id());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o administrador não existir")
        void deveLancarExcecaoQuandoAdministradorNaoExistir() {
            UUID id = UUID.randomUUID();

            when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.buscarAdministradorPorId(id));

            verificarNotFound(exception);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o usuário não for administrador")
        void deveLancarExcecaoQuandoUsuarioNaoForAdministrador() {
            UsuariosEntity monitor = criarUsuario(TipoUsuario.MONITOR);

            when(usuarioRepository.findById(monitor.getIdUsuario())).thenReturn(Optional.of(monitor));

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.buscarAdministradorPorId(monitor.getIdUsuario()));

            verificarNotFound(exception);
        }
    }

    @Nested
    @DisplayName("Testes do método atualizarAdministrador")
    class AtualizarAdministradorTest {

        @Test
        @DisplayName("Deve atualizar um administrador com sucesso")
        void deveAtualizarAdministrador() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.findById(administrador.getIdUsuario())).thenReturn(Optional.of(administrador));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), administrador.getIdUsuario())).thenReturn(false);
            when(usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), administrador.getIdUsuario())).thenReturn(false);

            configurarEncoder();
            configurarSave();

            var resultado = usuarioService.atualizarAdministrador(administrador.getIdUsuario(), request);

            assertEquals(request.nome(), resultado.nome());
            assertEquals(request.email(), resultado.email());

            verify(usuarioRepository).save(administrador);
        }

        @Test
        @DisplayName("Deve lançar exceção quando o novo e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaCadastrado() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.findById(administrador.getIdUsuario())).thenReturn(Optional.of(administrador));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), administrador.getIdUsuario())).thenReturn(true);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> usuarioService.atualizarAdministrador(administrador.getIdUsuario(), request));

            verificarConflict(exception);
            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o novo CPF já estiver cadastrado")
        void deveLancarExcecaoQuandoCpfJaCadastrado() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);
            UsuarioRequest request = criarUsuarioRequest();

            when(usuarioRepository.findById(administrador.getIdUsuario())).thenReturn(Optional.of(administrador));
            when(usuarioRepository.existsByEmailAndIdUsuarioNot(request.email(), administrador.getIdUsuario())).thenReturn(false);
            when(usuarioRepository.existsByCpfAndIdUsuarioNot(request.cpf(), administrador.getIdUsuario())).thenReturn(true);

            ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                    () -> usuarioService.atualizarAdministrador(administrador.getIdUsuario(), request));

            verificarConflict(exception);
            verify(usuarioRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Testes do método excluirAdministrador")
    class ExcluirAdministradorTest {

        @Test
        @DisplayName("Deve excluir um administrador com sucesso")
        void deveExcluirAdministrador() {
            UsuariosEntity administrador = criarUsuario(TipoUsuario.ADMINISTRADOR);

            when(usuarioRepository.findById(administrador.getIdUsuario())).thenReturn(Optional.of(administrador));

            usuarioService.excluirAdministrador(administrador.getIdUsuario());

            assertFalse(administrador.getStatusUsuario());

            verify(usuarioRepository).save(administrador);
            verify(usuarioRepository).deleteById(administrador.getIdUsuario());
        }

        @Test
        @DisplayName("Deve lançar exceção quando o administrador não existir")
        void deveLancarExcecaoQuandoAdministradorNaoExistir() {
            UUID id = UUID.randomUUID();

            when(usuarioRepository.findById(id)).thenReturn(Optional.empty());

            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> usuarioService.excluirAdministrador(id));

            verificarNotFound(exception);
            verify(usuarioRepository, never()).save(any());
            verify(usuarioRepository, never()).deleteById(any());
        }
    }
}