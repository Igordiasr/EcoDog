package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.AgendamentoCriadoResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.OrcamentoResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.PetsDoTutorResponse;
import br.com.ecodogpark.backend.dto.AgendamentoTutorDTO.VagasDisponiveisResponse;
import br.com.ecodogpark.backend.entity.*;
import br.com.ecodogpark.backend.enums.SituacaoAgendamento;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class AgendamentoMapper {
    public static ContratosEntity paraEntity(PetsEntity pet, ServicosEntity servico, List<LocalDate> datas, BigDecimal valor, String situacao) {
        ContratosEntity contrato = new ContratosEntity();
        contrato.setPet(pet);
        contrato.setServicos(servico);
        contrato.setDataInicio(datas.getFirst());
        contrato.setDataFim(datas.getLast());
        contrato.setValor(valor);
        contrato.setSituacao(situacao);

        return contrato;
    }

    public static MovimentacoesEntity paraEntity(ContratosEntity contrato, BigDecimal valor) {
        MovimentacoesEntity movimentacao = new MovimentacoesEntity();
        movimentacao.setContrato(contrato);
        movimentacao.setValor(valor);
        movimentacao.setDataRegistro(LocalDate.now());
        movimentacao.setSituacao("PENDENTE");

        return movimentacao;
    }

    public static AgendamentosEntity paraEntity(PetsEntity pet, CalendarioEntity calendario, LocalDate data, String servico, SituacaoAgendamento situacaoAgendamento) {
        AgendamentosEntity agendamento = new AgendamentosEntity();
        agendamento.setFkPet(pet);
        agendamento.setFkCalendario(calendario);
        agendamento.setDataEntrada(data.atStartOfDay());
        agendamento.setServico(servico);
        agendamento.setSituacao(situacaoAgendamento);

        return agendamento;
    }

    public static PetsDoTutorResponse entityParaResponse(PetsEntity pet) {
        return new PetsDoTutorResponse(
                pet.getIdPet(),
                pet.getNome(),
                pet.getStatusAdaptacao()
        );
    }

    public static VagasDisponiveisResponse paraVagasDisponiveisResponse(LocalDate data, String servico, Integer capacidade, Long vagasDisponiveis) {
        return new VagasDisponiveisResponse(
                data,
                servico,
                capacidade,
                vagasDisponiveis
        );
    }

    public static OrcamentoResponse paraOrcamentoResponse(ServicosEntity servico, List<PetsEntity> pets, List<LocalDate> datas, BigDecimal valorTotal) {
        return new OrcamentoResponse(
                servico.getNome(),
                servico.getModalidade(),
                pets.stream().map(PetsEntity::getNome).toList(),
                datas,
                valorTotal
        );
    }

    public static AgendamentoCriadoResponse paraAgendamentoCriadoResponse(BigDecimal total, boolean tutorEhAprovado) {
        return new AgendamentoCriadoResponse(
                total,
                tutorEhAprovado
        );
    }
}
