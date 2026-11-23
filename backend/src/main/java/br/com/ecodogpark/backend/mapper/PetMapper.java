package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroAlergiaPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroMedicacaoPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroVacinaPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.repository.MedicacoesDoPetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Component
public class PetMapper {
    public static PetsEntity requestParaEntity(CadastroPetRequest petRequest) {
        PetsEntity pet = new PetsEntity();
        pet.setNome(petRequest.nome());
        pet.setRaca(petRequest.raca());
        pet.setSexo(petRequest.sexo());
        pet.setCastrado(petRequest.castrado());
        pet.setDataNascimento(petRequest.dataNascimento());
        pet.setObservacao(petRequest.observacao());
        pet.setRelacaoComOutros(petRequest.relacaoComOutros());
        pet.setVeterinario(petRequest.veterinario());
        pet.setTelefoneVeterinario(petRequest.telefoneVeterinario());
        pet.setConvenio(petRequest.convenio());
        return pet;
    }

    public static NovoPetResponse entityParaPetResponse(PetsEntity pet) {
        return new NovoPetResponse(
                pet.getIdPet(),
                pet.getNome(),
                pet.getRaca(),
                pet.getSexo(),
                pet.getCastrado(),
                pet.getDataNascimento(),
                pet.getObservacao(),
                pet.getRelacaoComOutros(),
                pet.getVeterinario(),
                pet.getTelefoneVeterinario(),
                pet.getConvenio(),
                pet.getFkUsuario().getIdUsuario()
        );
    }

    public static PetParaListaResponse entityParaPetParaLista(PetsEntity pet) {
        return new PetParaListaResponse(
                pet.getIdPet(),
                pet.getNome(),
                pet.getRaca(),
                pet.getSexo(),
                pet.getCastrado(),
                pet.getDataNascimento()
        );
    }

    public static AlergiasDoPetEntity alergiaDoPetParaEntity(PetsEntity pet, AlergiasEntity alergia) {
        AlergiasDoPetEntity associacao = new AlergiasDoPetEntity();
        associacao.setPet(pet);
        associacao.setAlergia(alergia);

        return associacao;
    }

    public static VacinasDoPetEntity vacinasDoPetParaEntity(CadastroVacinaPetRequest request, PetsEntity pet, VacinasEntity vacina) {
        VacinasDoPetEntity associacao = new VacinasDoPetEntity();
        associacao.setPet(pet);
        associacao.setVacina(vacina);
        associacao.setDataAplicacao(request.dataAplicacao());
        associacao.setDataValidade(request.dataValidade());

        return associacao;
    }

    public static MedicacoesDoPetEntity medicacoesDoPetParaEntity(CadastroMedicacaoPetRequest request, PetsEntity pet, MedicacoesEntity medicacao) {
        MedicacoesDoPetEntity associacao = new MedicacoesDoPetEntity();
        associacao.setFkPet(pet);
        associacao.setFkMedicacao(medicacao);
        associacao.setFrequencia(request.frequencia());
        associacao.setDosagem(request.dosagem());
        associacao.setEmUso(request.emUso());

        return associacao;
    }

    public static CadastroPetResponse consolidarCadastroPet(
            NovoPetResponse pet,
            List<AlergiaParaListaResponse> alergias,
            List<MedicacaoParaListaResponse> medicacoes,
            List<VacinaParaListaResponse> vacinas
            ) {
        return new CadastroPetResponse(
                pet.idPet(),
                pet.nome(),
                pet.raca(),
                pet.sexo(),
                pet.castrado(),
                pet.dataNascimento(),
                pet.observacao(),
                pet.relacaoComOutros(),
                pet.veterinario(),
                pet.telefoneVeterinario(),
                pet.convenio(),
                pet.idTutor(),
                medicacoes,
                vacinas,
                alergias
        );
    }

    public static AlergiaParaListaResponse entityParaAlergiaParaLista(AlergiasDoPetEntity alergia) {
        return new AlergiaParaListaResponse(
                alergia.getAlergia()
        );
    }

    public static MedicacaoParaListaResponse entityParaMedicacaoParaLista(MedicacoesDoPetEntity medicacao) {
        return new MedicacaoParaListaResponse(
                medicacao.getFkMedicacao(),
                medicacao.getEmUso(),
                medicacao.getDosagem(),
                medicacao.getFrequencia()
        );
    }

    public static VacinaParaListaResponse entityParaVacinaParaLista(VacinasDoPetEntity vacina) {
        return new VacinaParaListaResponse(
                vacina.getVacina(),
                vacina.getDataAplicacao(),
                vacina.getDataValidade()
        );
    }

    public static void AtualizarEntity(PetsEntity pet, CadastroPetRequest request) {
        pet.setNome(request.nome());
        pet.setRaca(request.raca());
        pet.setSexo(request.sexo());
        pet.setCastrado(request.castrado());
        pet.setDataNascimento(request.dataNascimento());
        pet.setObservacao(request.observacao());
        pet.setRelacaoComOutros(request.relacaoComOutros());
        pet.setVeterinario(request.veterinario());
        pet.setTelefoneVeterinario(request.telefoneVeterinario());
        pet.setConvenio(request.convenio());
    }

    public static void atualizarMedicacao(CadastroMedicacaoPetRequest request, MedicacoesDoPetEntity associacao) {
        associacao.setFrequencia(request.frequencia());
        associacao.setDosagem(request.dosagem());
        associacao.setEmUso(request.emUso());
    }

    public static void atualizarVacina(CadastroVacinaPetRequest request, VacinasDoPetEntity associacao) {
        associacao.setDataAplicacao(request.dataAplicacao());
        associacao.setDataValidade(request.dataValidade());
    }
}
