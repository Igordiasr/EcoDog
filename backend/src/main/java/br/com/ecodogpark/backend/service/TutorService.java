package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.TutorDTO.request.*;
import br.com.ecodogpark.backend.dto.TutorDTO.response.*;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.TipoUsuario;
import br.com.ecodogpark.backend.exception.*;
import br.com.ecodogpark.backend.mapper.PetMapper;
import br.com.ecodogpark.backend.mapper.TutorMapper;
import br.com.ecodogpark.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TutorService {
    private final PetRepository petRepository;
    private final UsuarioRepository usuarioRepository;
    private final MedicacoesDoPetRepository medicacoesDoPetRepository;
    private final VacinasDoPetRepository vacinasDoPetRepository;
    private final AlergiasDoPetRepository alergiasDoPetRepository;
    private final AlergiasRepository alergiasRepository;
    private final VacinasRepository vacinasRepository;
    private final MedicacoesRepository medicacoesRepository;

    public TutorService(
            PetRepository petRepository,
            UsuarioRepository usuarioRepository,
            MedicacoesDoPetRepository medicacoesDoPetRepository,
            VacinasDoPetRepository vacinasDoPetRepository,
            AlergiasDoPetRepository alergiasDoPetRepository,
            AlergiasRepository alergiasRepository,
            VacinasRepository vacinasRepository,
            MedicacoesRepository medicacoesRepository


    ) {
        this.petRepository = petRepository;
        this.usuarioRepository = usuarioRepository;
        this.medicacoesDoPetRepository = medicacoesDoPetRepository;
        this.vacinasDoPetRepository = vacinasDoPetRepository;
        this.alergiasDoPetRepository = alergiasDoPetRepository;
        this.alergiasRepository = alergiasRepository;
        this.vacinasRepository = vacinasRepository;
        this.medicacoesRepository = medicacoesRepository;
    }

    public MeusDadosResponse meusDados(UUID idTutor) {
        UsuariosEntity tutor = buscarTutor(idTutor);

        return TutorMapper.entityParaResponse(tutor);
    }

    @Transactional
    public MeusDadosResponse atualizarDados(UUID idTutor, AtualizarDadosRequest request) {
        UsuariosEntity tutor = buscarTutor(idTutor);

        TutorMapper.atualizarEntity(tutor, request);
        usuarioRepository.save(tutor);

        return TutorMapper.entityParaResponse(tutor);
    }

    @Transactional
    public CadastroPetResponse cadastrarNovoPet(CadastroPetRequest cadastroPetRequest, UUID idTutor) {
        UsuariosEntity tutor = buscarTutor(idTutor);

        if (petRepository.existsByFkUsuarioAndNome(tutor, cadastroPetRequest.nome())) throw new ConflitoAoCadastrarException("Pet já cadastrado");

        List<VacinasEntity> vacinasEncontradas = buscarVacinas(cadastroPetRequest);
        List<AlergiasEntity> alergiasEncontradas = buscarAlergias(cadastroPetRequest);
        List<MedicacoesEntity> medicacoesEncontradas = buscarMedicacoes(cadastroPetRequest);

        PetsEntity pet = PetMapper.requestParaEntity(cadastroPetRequest);
        pet.setFkUsuario(tutor);

        NovoPetResponse novoPet = PetMapper.entityParaPetResponse(petRepository.save(pet));

        List<VacinasDoPetEntity> vacinasParaSalvar = cadastroPetRequest.vacinasDoPet().stream()
                .map(vacinaRequest -> {
                    VacinasEntity vacina = vacinasEncontradas.stream()
                            .filter(item -> item.getIdVacinas().equals(vacinaRequest.idVacina())).findFirst()
                            .orElseThrow(() -> new VacinaNaoEncontradaException("Vacina não encontrada"));

                    return PetMapper.vacinasDoPetParaEntity(vacinaRequest, pet, vacina);
                }).toList();

        List<VacinaParaListaResponse> vacinasDoPet =
                vacinasDoPetRepository.saveAll(vacinasParaSalvar).stream()
                .map(PetMapper::entityParaVacinaParaLista).toList();

        List<AlergiasDoPetEntity> alergiasParaSalvar = cadastroPetRequest.alergiasDoPet().stream()
                .map(alergiaRequest -> {
                    AlergiasEntity alergia = alergiasEncontradas.stream()
                            .filter(item -> item.getIdAlergias().equals(alergiaRequest.idAlergia())).findFirst()
                            .orElseThrow(() -> new AlergiaNaoEncontradaException("Alergia não encontrada"));

                    return PetMapper.alergiaDoPetParaEntity(pet, alergia);
                }).toList();

        List<AlergiaParaListaResponse> alergiasDoPet = alergiasDoPetRepository.saveAll(alergiasParaSalvar).stream()
                .map(PetMapper::entityParaAlergiaParaLista).toList();

        List<MedicacoesDoPetEntity> medicacoesParaSalvar = cadastroPetRequest.medicacoesDoPet().stream()
                .map(medicacaoRequest -> {
                    MedicacoesEntity medicacao = medicacoesEncontradas.stream()
                            .filter(item -> item.getIdMedicacoes().equals(medicacaoRequest.idMedicacao())).findFirst()
                            .orElseThrow(() -> new MedicacaoNaoEncontradaException("Medicação não encontrada"));
                    return PetMapper.medicacoesDoPetParaEntity(medicacaoRequest, pet, medicacao);
                }).toList();

        List<MedicacaoParaListaResponse> medicacoesDoPet = medicacoesDoPetRepository.saveAll(medicacoesParaSalvar)
                .stream().map(PetMapper::entityParaMedicacaoParaLista).toList();

        return PetMapper.consolidarCadastroPet(novoPet, alergiasDoPet, medicacoesDoPet, vacinasDoPet);
    }

    public List<PetParaListaResponse> buscarPorIdTutor(UUID idTutor) {
        UsuariosEntity tutor = buscarTutor(idTutor);
        return petRepository.findByFkUsuario(tutor)
                .stream().map(PetMapper::entityParaPetParaLista).toList();
    }

    @Transactional
    public CadastroPetResponse atualizarDadosPet(UUID idTutor, UUID idPet, CadastroPetRequest cadastroPetRequest) {
        UsuariosEntity tutor = buscarTutor(idTutor);

        PetsEntity pet = petRepository.findById(idPet)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));

        if (!pet.getFkUsuario().getIdUsuario().equals(tutor.getIdUsuario()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este pet não pertence ao tutor informado");
        if (petRepository.existsByFkUsuarioAndNome(tutor, cadastroPetRequest.nome()))
            throw new ConflitoAoCadastrarException("Pet já cadastrado");

        List<AlergiasEntity> alergiasEncontradas = buscarAlergias(cadastroPetRequest);
        List<VacinasEntity> vacinasEncontradas = buscarVacinas(cadastroPetRequest);
        List<MedicacoesEntity> medicacoesEncontradas = buscarMedicacoes(cadastroPetRequest);
        PetMapper.AtualizarEntity(pet, cadastroPetRequest);

        PetsEntity petSalvo = petRepository.save(pet);
        NovoPetResponse petAtualizado = PetMapper.entityParaPetResponse(petSalvo);
        List<AlergiaParaListaResponse> alergias = sincronizarAlergias(cadastroPetRequest, petSalvo, alergiasEncontradas);
        List<VacinaParaListaResponse> vacinas = sincronizarVacinas(cadastroPetRequest, petSalvo, vacinasEncontradas);
        List<MedicacaoParaListaResponse> medicacoes = sincronizarMedicacoes(cadastroPetRequest, petSalvo, medicacoesEncontradas);

        return PetMapper.consolidarCadastroPet(petAtualizado, alergias, medicacoes, vacinas);
    }

    @Transactional
    public void excluir(UUID idTutor, UUID idPet) {
        UsuariosEntity tutor = buscarTutor(idTutor);
        if (!petRepository.existsByIdPetAndFkUsuario(idPet, tutor)) throw new DadosDivergentesException("ID do pet não pertence ao ID do tutor informado");
        petRepository.deleteById(idPet);
    }

    private UsuariosEntity buscarTutor(UUID idTutor) {
        UsuariosEntity tutor = usuarioRepository.findById(idTutor)
                .orElseThrow(() -> new TutorNaoEncontradoException("Tutor não encontrado"));

        if (tutor.getTipo() != TipoUsuario.TUTOR) {
            throw new TipoUsuarioInvalidoException("O usuário informado não é um Tutor");
        }
        return tutor;
    }

    private List<AlergiasEntity> buscarAlergias(CadastroPetRequest request) {
        List<Integer> ids = request.alergiasDoPet().stream()
                .map(CadastroAlergiaPetRequest::idAlergia)
                .toList();

        List<AlergiasEntity> alergias = alergiasRepository.findAllById(ids);
        if (alergias.size() != ids.stream().distinct().count()) {
            throw new AlergiaNaoEncontradaException("Uma ou mais alergias não foram encontradas");
        }

        return alergias;
    }

    private List<VacinasEntity> buscarVacinas(CadastroPetRequest request) {
        List<Integer> ids = request.vacinasDoPet().stream()
                .map(CadastroVacinaPetRequest::idVacina)
                .toList();

        List<VacinasEntity> vacinas = vacinasRepository.findAllById(ids);
        if (vacinas.size() != ids.stream().distinct().count()) {
            throw new VacinaNaoEncontradaException("Uma ou mais vacinas não foram encontradas");
        }

        return vacinas;
    }

    private List<MedicacoesEntity> buscarMedicacoes(CadastroPetRequest request) {
        List<Long> ids = request.medicacoesDoPet().stream()
                .map(CadastroMedicacaoPetRequest::idMedicacao)
                .toList();

        List<MedicacoesEntity> medicacoes = medicacoesRepository.findAllById(ids);
        if (medicacoes.size() != ids.stream().distinct().count()) {
            throw new MedicacaoNaoEncontradaException("Uma ou mais medicações não forma encontradas");
        }

        return medicacoes;
    }

    private List<AlergiaParaListaResponse> sincronizarAlergias(CadastroPetRequest request, PetsEntity pet, List<AlergiasEntity> alergiasEncontradas) {
        List<AlergiasDoPetEntity> atuais = alergiasDoPetRepository.findByPet(pet);
        List<AlergiasDoPetEntity> paraSalvar = new ArrayList<>(atuais);

        request.alergiasDoPet().forEach(alergiaRequest -> {
            boolean jaAssociada = atuais.stream().anyMatch(item -> item.getAlergia().getIdAlergias().equals(alergiaRequest.idAlergia()));

            if (!jaAssociada) {
                AlergiasEntity alergia = alergiasEncontradas.stream()
                        .filter(item -> item.getIdAlergias().equals(alergiaRequest.idAlergia())).findFirst()
                        .orElseThrow();

                paraSalvar.add(PetMapper.alergiaDoPetParaEntity(pet, alergia));
            }
        });
        return alergiasDoPetRepository.saveAll(paraSalvar).stream()
                .map(PetMapper::entityParaAlergiaParaLista).toList();
    }

    private List<VacinaParaListaResponse> sincronizarVacinas(CadastroPetRequest request, PetsEntity pet, List<VacinasEntity> vacinasEncontradas) {
        List<VacinasDoPetEntity> atuais = vacinasDoPetRepository.findByPet(pet);
        List<VacinasDoPetEntity> paraSalvar = new ArrayList<>(atuais);

        request.vacinasDoPet().forEach(vacinaRequest -> {
            VacinasDoPetEntity existente = atuais.stream()
                    .filter(item -> item.getVacina().getIdVacinas().equals(vacinaRequest.idVacina())).findFirst()
                    .orElse(null);

            if (existente != null) {
                PetMapper.atualizarVacina(vacinaRequest, existente);
            } else {
                VacinasEntity vacina = vacinasEncontradas.stream()
                        .filter(item -> item.getIdVacinas().equals(vacinaRequest.idVacina())).findFirst()
                        .orElseThrow();

                paraSalvar.add(PetMapper.vacinasDoPetParaEntity(vacinaRequest, pet, vacina));
            }
        });
        return vacinasDoPetRepository.saveAll(paraSalvar).stream()
                .map(PetMapper::entityParaVacinaParaLista).toList();
    }

    private List<MedicacaoParaListaResponse> sincronizarMedicacoes(CadastroPetRequest request, PetsEntity pet, List<MedicacoesEntity> medicacoesEncontradas) {
        List<MedicacoesDoPetEntity> atuais = medicacoesDoPetRepository.findByFkPet(pet);
        List<MedicacoesDoPetEntity> paraSalvar = new ArrayList<>(atuais);

        request.medicacoesDoPet().forEach(medicacaoRequest -> {
            MedicacoesDoPetEntity existente = atuais.stream()
                    .filter(item -> item.getFkMedicacao().getIdMedicacoes().equals(medicacaoRequest.idMedicacao())).findFirst()
                    .orElse(null);

            if (existente != null) {
                PetMapper.atualizarMedicacao(medicacaoRequest, existente);
            } else {
                MedicacoesEntity medicacao = medicacoesEncontradas.stream()
                        .filter(item -> item.getIdMedicacoes().equals(medicacaoRequest.idMedicacao())).findFirst()
                        .orElseThrow();

                paraSalvar.add(PetMapper.medicacoesDoPetParaEntity(medicacaoRequest, pet, medicacao));
            }
        });
        return medicacoesDoPetRepository.saveAll(paraSalvar).stream()
                .map(PetMapper::entityParaMedicacaoParaLista).toList();
    }
}
