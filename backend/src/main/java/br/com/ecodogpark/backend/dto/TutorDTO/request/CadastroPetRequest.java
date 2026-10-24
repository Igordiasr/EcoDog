package br.com.ecodogpark.backend.dto.TutorDTO.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CadastroPetRequest(
        @NotBlank
        @Size(max = 100)
        String nome,
        @NotBlank
        @Size(max = 100)
        String raca,
        @NotBlank
        @Size(min = 1, max = 1)
        String sexo,
        @NotNull
        Boolean castrado,
        @Past
        @NotNull
        LocalDate dataNascimento,
        @NotBlank
        @Size(max = 200)
        String observacao,
        @NotBlank
        @Size(max = 100)
        String relacaoComOutros,
        @NotBlank
        String veterinario,
        @NotBlank
        String telefoneVeterinario,
        @NotNull
        Boolean convenio,
        @NotNull
        List<CadastroMedicacaoPetRequest> medicacoesDoPet,
        @NotNull
        List<CadastroVacinaPetRequest> vacinasDoPet,
        @NotNull
        List<CadastroAlergiaPetRequest> alergiasDoPet
) {
}
