package br.com.ecodogpark.backend;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.OrcamentoRequest;
import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.entity.ServicosEntity;
import br.com.ecodogpark.backend.exception.PetSemAdaptacaoException;
import br.com.ecodogpark.backend.repository.PetRepository;
import br.com.ecodogpark.backend.repository.ServicosRepository;
import br.com.ecodogpark.backend.service.AgendamentoTutorService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class AgendamentoTest {
    @Mock
    private PetRepository petRepository;

    @Mock
    private ServicosRepository servicoRepository;

    @InjectMocks
    private AgendamentoTutorService agendamentoTutorService;

    @Test
    @DisplayName("Calcular orçamento quando pet não possui adaptação deve lançar exception")
    void calcularOrcamentoQuandoPetNaoPossuiAdaptacaoDeveLancarException() {
        // Arrange
        UUID idTutor = UUID.randomUUID();
        UUID idPet = UUID.randomUUID();

        PetsEntity pet = new PetsEntity();
        pet.setIdPet(idPet);
        pet.setNome("Rex");
        pet.setStatusAdaptacao(false);

        OrcamentoRequest request = new OrcamentoRequest(
                1,
                List.of(idPet),
                List.of(LocalDate.now().plusDays(1)),
                null,
                List.of()
        );

        ServicosEntity servico = new ServicosEntity();
        servico.setIdServico(1);
        servico.setStatus(true);
        servico.setModalidade("AVULSO");
        servico.setCategoria("DAYUSE");
        servico.setNome("Day Use");
        servico.setValor(new BigDecimal("90.00"));

        Mockito.when(servicoRepository.findById(1)).thenReturn(Optional.of(servico));
        Mockito.when(petRepository.findByIdPetInAndFkUsuarioIdUsuario(List.of(idPet), idTutor)).thenReturn(List.of(pet));

        // Act
        PetSemAdaptacaoException exception = Assertions.assertThrows(
                PetSemAdaptacaoException.class, () -> agendamentoTutorService.calcularOrcamento(request, idTutor));

        // Assert
        Assertions.assertEquals(pet.getNome() + " não possui adaptação na Ecodog.", exception.getMessage());

    }
}
