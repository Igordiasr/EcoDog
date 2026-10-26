package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados de entrada para cadastro pet")
public record CadastroPetRequest(
        @NotBlank
        @Size(max = 100)
        @Schema(description = "Nome do pet")
        String nome,
        @NotBlank
        @Size(max = 100)
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @NotBlank
        @Size(min = 1, max = 1)
        @Schema(description = "Sexo do pet", example = "M")
        String sexo,
        @NotNull
        @Schema(description = "Indica se o pet é castrado", example = "true")
        Boolean castrado,
        @Past
        @NotNull
        @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        LocalDate dataNascimento,
        @NotBlank
        @Size(max = 200)
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao,
        @NotBlank
        @Size(max = 100)
        @Schema(description = "Comportamento do pet ao interagir com outros animais")
        String relacaoComOutros,
        @NotBlank
        @Schema(description = "Nome do veterinário responsável")
        String veterinario,
        @NotBlank
        @Schema(description = "Telefone de contato do veterinário")
        String telefoneVeterinario,
        @NotNull
        @Schema(description = "Indica se o pet possui convênio veterinário", example = "true")
        Boolean convenio,
        @NotNull
        @Schema(description = "Medicações associadas ao pet")
        List<CadastroMedicacaoPetRequest> medicacoesDoPet,
        @NotNull
        @Schema(description = "Vacinas associadas ao pet")
        List<CadastroVacinaPetRequest> vacinasDoPet,
        @NotNull
        @Schema(description = "Alergias associadas ao pet")
        List<CadastroAlergiaPetRequest> alergiasDoPet
) {
}
