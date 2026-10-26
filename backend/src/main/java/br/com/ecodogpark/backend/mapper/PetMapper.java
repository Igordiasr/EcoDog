package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TutorDTO.request.CadastroPetRequest;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.repository.MedicacoesDoPetRepository;
import org.springframework.stereotype.Component;

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

    public static List<AlergiasDoPetEntity> alergiaDoPetParaEntity(CadastroPetRequest petRequest, PetsEntity pet) {
        List<AlergiasDoPetEntity> alergiasDoPet = new ArrayList<>();
        petRequest.alergiasDoPet().forEach(
                alergia -> {
                    AlergiasDoPetEntity novaAlergia = new AlergiasDoPetEntity();
                    novaAlergia.setAlergia(alergia.alergia());
                    novaAlergia.setPet(pet);
                    alergiasDoPet.add(novaAlergia);
                }
        );
        return alergiasDoPet;
    }

    public static List<VacinasDoPetEntity> vacinasDoPetParaEntity(CadastroPetRequest petRequest, PetsEntity pet) {
        List<VacinasDoPetEntity> vacinasDoPet = new ArrayList<>();
        petRequest.vacinasDoPet().forEach(
                vacina -> {
                    VacinasDoPetEntity novaVacina = new VacinasDoPetEntity();
                    novaVacina.setVacina(vacina.vacina());
                    novaVacina.setPet(pet);
                    novaVacina.setDataAplicacao(vacina.dataAplicacao());
                    novaVacina.setDataValidade(vacina.dataValidade());
                    vacinasDoPet.add(novaVacina);
                }
        );
        return vacinasDoPet;
    }

    public static List<MedicacoesDoPetEntity> medicacoesDoPetParaEntity(CadastroPetRequest petRequest, PetsEntity pet) {
        List<MedicacoesDoPetEntity> medicacoesDoPet = new ArrayList<>();
        petRequest.medicacoesDoPet().forEach(
                medicacao -> {
                    MedicacoesDoPetEntity novaMedicacao = new MedicacoesDoPetEntity();
                    novaMedicacao.setFkMedicacao(medicacao.medicacao());
                    novaMedicacao.setFkPet(pet);
                    novaMedicacao.setFrequencia(medicacao.frequencia());
                    novaMedicacao.setDosagem(medicacao.dosagem());
                    novaMedicacao.setEmUso(medicacao.emUso());
                    medicacoesDoPet.add(novaMedicacao);
                }
        );
        return medicacoesDoPet;
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
}
