package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AtividadesDoDiaDTO.response.*;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.ParticipacaoDoPetRepository;
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
public class AtividadesDoDiaService {
    private final ParticipacaoDoPetRepository participacaoDoPetRepository;
    private final AtividadeDoDiaRepository atividadeDoDiaRepository;

    public AtividadesDoDiaService(ParticipacaoDoPetRepository participacaoDoPetRepository, AtividadeDoDiaRepository atividadeDoDiaRepository) {
        this.participacaoDoPetRepository = participacaoDoPetRepository;
        this.atividadeDoDiaRepository = atividadeDoDiaRepository;
    }

    public AtividadesDoDiaResponse buscarAtividadesDoDia() {
        LocalDate data = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        List<DBAtividadesResponse> atividadesParaFiltrar = participacaoDoPetRepository.listarAtividadesdoDia(data);
        List<AtividadeProgramadaResponse> atividadesDoDia = atividadesParaFiltrar.stream()
                .collect(Collectors.groupingBy(
                        DBAtividadesResponse::idAtividadeDoDia,
                        LinkedHashMap::new,
                        Collectors.groupingBy(
                                linha -> Optional.ofNullable(linha.grupo()).orElse(0),
                                LinkedHashMap::new,
                                Collectors.toList()
                        )
                ))
                .values().stream()
                .map(gruposMap -> {
                    DBAtividadesResponse dadosAtividade = gruposMap.values().iterator().next().getFirst();
                    List<GrupoPetsResponse> listaGrupos = gruposMap.entrySet().stream()
                            .map(grupoEntry -> {
                                Integer numeroGrupo = grupoEntry.getKey();
                                List<DBAtividadesResponse> linhasGrupo = grupoEntry.getValue();
                                List<PetPoucosDetalhesResponse> petsGrupo = linhasGrupo.stream()
                                        .map(pet -> new PetPoucosDetalhesResponse(
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
                            dadosAtividade.idAtividadeDoDia(),
                            dadosAtividade.atividade(),
                            dadosAtividade.descricao(),
                            dadosAtividade.categoria(),
                            dadosAtividade.horaInicio(),
                            dadosAtividade.horaFim(),
                            dadosAtividade.andamento(),
                            listaGrupos
                    );
                })
                .toList();
        return new AtividadesDoDiaResponse(data, atividadesDoDia);
    }

    public void concluirAtividade(String situacao, Long idAtividade) {
        if (!atividadeDoDiaRepository.existsById(idAtividade)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Atividade não encontrada");
        }
        atividadeDoDiaRepository.concluirAtividade(situacao, idAtividade);
    }

    public void concluirAtividadeTodosPets(List<Long> idsParticipacoes) {
        participacaoDoPetRepository.concluirAtividadeTodosPets("PARTICIPOU", idsParticipacoes);
    }
}
