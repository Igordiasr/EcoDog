package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.DiasComAgendamentoResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.PetsDoTutorResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.VagasDisponiveisResponse;
import br.com.ecodogpark.backend.entity.CalendarioEntity;
import br.com.ecodogpark.backend.entity.PetsEntity;
import br.com.ecodogpark.backend.repository.AgendamentosRepository;
import br.com.ecodogpark.backend.repository.CalendarioRepository;
import br.com.ecodogpark.backend.repository.PetsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AgendamentoTutorService {
    private final AgendamentosRepository agendamentosRepository;
    private final CalendarioRepository calendarioRepository;
    private final PetsRepository petsRepository;
    private static final Integer capacidadePadrao = 10;

    public AgendamentoTutorService(AgendamentosRepository agendamentosRepository,
                                   CalendarioRepository calendarioRepository,
                                   UsuarioService usuarioService,
                                   PetsRepository petsRepository) {
        this.agendamentosRepository = agendamentosRepository;
        this.calendarioRepository = calendarioRepository;
        this.petsRepository = petsRepository;
    }

    public List<PetsDoTutorResponse> buscarPets(Long idUsuario) {
        List<PetsEntity> pets = petsRepository.findByFkUsuarioIdUsuario(idUsuario);
        List<PetsDoTutorResponse> petsDoTutor = new ArrayList<>();

        for (PetsEntity pet : pets) {
            PetsDoTutorResponse response = paraDtoPetTutor(pet);
            petsDoTutor.add(response);
        }

        return petsDoTutor;
    }

    public List<VagasDisponiveisResponse> buscarDisponibilidade (String servico, Integer ano, Integer mes) {
        List<VagasDisponiveisResponse> responses = new ArrayList<>();

        YearMonth mesEscolhido = YearMonth.of(ano, mes);
        LocalDate primeiroDia = mesEscolhido.atDay(1);
        LocalDate ultimoDia = mesEscolhido.atEndOfMonth();

        LocalDateTime inicioAgendamentos = primeiroDia.atStartOfDay();
        LocalDateTime fimAgendamentos = mesEscolhido.plusMonths(1).atDay(1).atStartOfDay();

        List<CalendarioEntity> calendario =
                calendarioRepository.buscarCalendario(primeiroDia, ultimoDia);
        Map<LocalDate, CalendarioEntity> mapCalendario = calendario.stream()
                .collect(Collectors.toMap(
                        CalendarioEntity::getData,
                        row -> row
                ));

        List<DiasComAgendamentoResponse> agendamentos =
                agendamentosRepository.buscarAgendamentoPorServico(servico, inicioAgendamentos, fimAgendamentos);
        Map<LocalDate, Long> mapAgendamento = agendamentos.stream()
                .collect(Collectors.toMap(
                        DiasComAgendamentoResponse::data,
                        DiasComAgendamentoResponse::totalPetsAgendados
                ));

        for (LocalDate data = primeiroDia; !data.isAfter(ultimoDia); data = data.plusDays(1)) {
            CalendarioEntity calendarioEntity = mapCalendario.get(data);
            Long totalAgendados = mapAgendamento.getOrDefault(data, 0L);
            Integer capacidadeTotal;

            if (servico.equals("CRECHE") || servico.equals("DAYUSE")) {
                if (calendarioEntity == null || calendarioEntity.getVagasCreche() == null) {
                    capacidadeTotal = capacidadePadrao;
                } else {
                    capacidadeTotal = calendarioEntity.getVagasCreche();
                }

            } else if (servico.equals("HOTEL")) {
                if (calendarioEntity == null || calendarioEntity.getVagasHotel() == null) {
                    capacidadeTotal = capacidadePadrao;
                } else {
                    capacidadeTotal = calendarioEntity.getVagasHotel();
                }
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado");
            }

            Long disponibilidade = Math.max(0L, capacidadeTotal.longValue() - totalAgendados);

            VagasDisponiveisResponse response = new VagasDisponiveisResponse(
                    data,
                    servico,
                    capacidadeTotal,
                    disponibilidade
            );
                responses.add(response);

        }
        return responses;
    }

    public buscarServicosAtivos() {

    }


    private PetsDoTutorResponse paraDtoPetTutor(PetsEntity pet) {
        return new PetsDoTutorResponse(
                pet.getIdPet(),
                pet.getNome()
        );
    }
}
