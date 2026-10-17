package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.*;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.ParticipacaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AtividadesService {
    private final ParticipacaoRepository participacaoRepository;
    private final AtividadeDoDiaRepository atividadeDoDiaRepository;

    public AtividadesService(ParticipacaoRepository participacaoRepository, AtividadeDoDiaRepository atividadeDoDiaRepository) {
        this.participacaoRepository = participacaoRepository;
        this.atividadeDoDiaRepository = atividadeDoDiaRepository;
    }

    public AtividadesResponse buscarAtividadesDoDia() {
        LocalDate data = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        List<AtividadeDoDiaQueryResponse> linhasAtividades = participacaoRepository.listarAtividadesDoDia(data);
        List<AtividadeProgramadaResponse> atividadesDoDia = linhasAtividades.stream()
                .collect(Collectors.groupingBy(
                        AtividadeDoDiaQueryResponse::idAtividadeDoDia,
                        LinkedHashMap::new,
                        Collectors.groupingBy(
                                linha -> Optional.ofNullable(linha.grupo()).orElse(0),
                                LinkedHashMap::new,
                                Collectors.toList()
                        )
                ))
                .values().stream()
                .map(mapaDeGrupos -> {
                    AtividadeDoDiaQueryResponse linhaAtividadeReferencia = mapaDeGrupos.values().iterator().next().getFirst();
                    List<GrupoPetsResponse> listaGrupos = mapaDeGrupos.entrySet().stream()
                            .map(grupoEntry -> {
                                Integer numeroGrupo = grupoEntry.getKey();
                                List<AtividadeDoDiaQueryResponse> linhasGrupo = grupoEntry.getValue();
                                List<PetResumoResponse> petsGrupo = linhasGrupo.stream()
                                        .map(pet -> new PetResumoResponse(
                                                pet.idPet(),
                                                pet.nomeDoPet(),
                                                pet.idParticipacaoDoPet(),
                                                pet.idAgendamento()
                                        ))
                                        .toList();
                                return new GrupoPetsResponse(numeroGrupo, petsGrupo);
                            })
                            .toList();
                    return new AtividadeProgramadaResponse(
                            linhaAtividadeReferencia.idAtividadeDoDia(),
                            linhaAtividadeReferencia.atividade(),
                            linhaAtividadeReferencia.descricao(),
                            linhaAtividadeReferencia.categoria(),
                            linhaAtividadeReferencia.horaInicio(),
                            linhaAtividadeReferencia.horaFim(),
                            linhaAtividadeReferencia.andamento(),
                            listaGrupos
                    );
                })
                .toList();
        return new AtividadesResponse(data, atividadesDoDia);
    }

    public void concluirAtividade(String situacao, Long idAtividadeDoDia) {
        if (!atividadeDoDiaRepository.existsById(idAtividadeDoDia)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada");
        }
        atividadeDoDiaRepository.concluirAtividade(situacao, idAtividadeDoDia);
    }

    public void concluirAtividadeTodosPets(List<Long> idsParticipacoes) {
        participacaoRepository.concluirAtividadeTodosPets("PARTICIPOU", idsParticipacoes);
    }
}
