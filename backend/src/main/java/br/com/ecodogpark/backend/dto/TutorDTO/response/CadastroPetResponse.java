package br.com.ecodogpark.backend.dto.TutorDTO.response;

import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroAlergiaPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroMedicacaoPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroVacinaPetRequest;
import br.com.ecodogpark.backend.entity.AlergiasDoPetEntity;
import br.com.ecodogpark.backend.entity.MedicacoesDoPetEntity;
import br.com.ecodogpark.backend.entity.VacinasDoPetEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CadastroPetResponse(
        Long idPet,
        String nome,
        String raca,
        String sexo,
        Boolean castrado,
        LocalDate dataNascimento,
        String observacao,
        String relacaoComOutros,
        String veterinario,
        String telefoneVeterinario,
        Boolean convenio,
        Long idTutor,
        List<MedicacaoParaListaResponse> medicacoesDoPet,
        List<VacinaParaListaResponse> vacinasDoPet,
        List<AlergiaParaListaResponse> alergiasDoPet
) {
}
