package br.com.ecodogpark.backend.dto.TutorDTO.request;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados de entrada para cadastro pet")
public record CadastroPetRequest(
        @Schema(description = "Nome do pet")
        @NotBlank @Size(max = 100)
        String nome,

        @Schema(description = "Raça do pet", example = "Labrador")
        @NotBlank @Size(max = 100)
        String raca,

        @Schema(description = "Sexo do pet", example = "M")
        @NotBlank @Size(min = 1, max = 1)
        String sexo,

        @Schema(description = "Indica se o pet é castrado", example = "true")
        @NotNull
        Boolean castrado,

        @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        @Past @NotNull
        LocalDate dataNascimento,

        @Schema(description = "Observação sobre o pet ou o registro")
        @NotBlank @Size(max = 200)
        String observacao,

        @Schema(description = "Comportamento do pet ao interagir com outros animais")
        @NotBlank @Size(max = 50)
        String relacaoComOutros,

        @Schema(description = "Nome do veterinário responsável")
        @NotBlank @Size(max = 100)
        String veterinario,

        @Schema(description = "Telefone de contato do veterinário")
        @NotBlank @Size(max = 11)
        String telefoneVeterinario,

        @Schema(description = "Indica se o pet possui convênio veterinário", example = "true")
        @NotNull
        Boolean convenio,

        @Schema(description = "Vacinas associadas ao pet")
        @NotNull
        List<@Valid CadastroVacinaPetRequest> vacinasDoPet,

        @Schema(description = "Alergias associadas ao pet")
        List<@Valid CadastroAlergiaPetRequest> alergiasDoPet,

        @Schema(description = "Medicações associadas ao pet")
        List<@Valid CadastroMedicacaoPetRequest> medicacoesDoPet
) {
}
