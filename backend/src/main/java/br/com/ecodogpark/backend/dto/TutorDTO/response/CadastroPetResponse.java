package br.com.ecodogpark.backend.dto.TutorDTO.response;

import io.swagger.v3.oas.annotations.media.Schema;

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

@Schema(description = "Dados de retorno de cadastro pet")
public record CadastroPetResponse(
        @Schema(description = "Identificador do pet", example = "1")
        Long idPet,
        @Schema(description = "Nome do pet")
        String nome,
        @Schema(description = "Raça do pet", example = "Labrador")
        String raca,
        @Schema(description = "Sexo do pet", example = "M")
        String sexo,
        @Schema(description = "Indica se o pet é castrado", example = "true")
        Boolean castrado,
        @Schema(description = "Data de nascimento do pet", example = "2020-05-10")
        LocalDate dataNascimento,
        @Schema(description = "Observação sobre o pet ou o registro")
        String observacao,
        @Schema(description = "Comportamento do pet ao interagir com outros animais")
        String relacaoComOutros,
        @Schema(description = "Nome do veterinário responsável")
        String veterinario,
        @Schema(description = "Telefone de contato do veterinário")
        String telefoneVeterinario,
        @Schema(description = "Indica se o pet possui convênio veterinário", example = "true")
        Boolean convenio,
        @Schema(description = "Identificador do tutor", example = "1")
        Long idTutor,
        @Schema(description = "Medicações associadas ao pet")
        List<MedicacaoParaListaResponse> medicacoesDoPet,
        @Schema(description = "Vacinas associadas ao pet")
        List<VacinaParaListaResponse> vacinasDoPet,
        @Schema(description = "Alergias associadas ao pet")
        List<AlergiaParaListaResponse> alergiasDoPet
) {
}
