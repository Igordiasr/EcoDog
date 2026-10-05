package br.com.ecodogpark.backend.service;

import br.com.ecodogpark.backend.dto.AtividadeDoDiaResponse;
import br.com.ecodogpark.backend.dto.PetResponse;
import br.com.ecodogpark.backend.entity.AgendamentoEntity;
import br.com.ecodogpark.backend.entity.ContratoEntity;
import br.com.ecodogpark.backend.entity.PetEntity;
import br.com.ecodogpark.backend.repository.AgendamentoRepository;
import br.com.ecodogpark.backend.repository.AtividadeDoDiaRepository;
import br.com.ecodogpark.backend.repository.MedicacaoDoDiaRepository;
import br.com.ecodogpark.backend.repository.ObservacaoDoDiaRepository;

import java.util.List;

public class FeedMonitorService {
    private final AgendamentoRepository agendamentoRepository;
    private final AtividadeDoDiaRepository atividadeDoDiaRepository;
    private final MedicacaoDoDiaRepository medicacaoDoDiaRepository;
    private final ObservacaoDoDiaRepository observacaoDoDiaRepository;
    private final PetService petService;


    public FeedMonitorService(AgendamentoRepository agendamentoRepository,
                              AtividadeDoDiaRepository atividadeDoDiaRepository,
                              MedicacaoDoDiaRepository medicacaoDoDiaRepository,
                              ObservacaoDoDiaRepository observacaoDoDiaRepository,
                              PetService petService) {
        this.agendamentoRepository = agendamentoRepository;
        this.atividadeDoDiaRepository = atividadeDoDiaRepository;
        this.medicacaoDoDiaRepository = medicacaoDoDiaRepository;
        this.observacaoDoDiaRepository = observacaoDoDiaRepository;
        this.petService = petService;
    }

    public PetResponse buscarPetParaMonitor(Long id) {
        return petService.buscarPorId(id);
    }


}
