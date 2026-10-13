package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.MedicacaoDoDiaEntity;
import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicacaoDoDiaRepository extends JpaRepository<MedicacaoDoDiaEntity, Long> {
    @Query("""
        SELECT m FROM MedicacaoDoDiaEntity m
          WHERE m.fkAgendamento.fkPet.idPet = :idPet
            AND m.fkAgendamento.fkCalendario.data = :data
            AND m.fkAgendamento.situacao = :situacao
    """)
    List<MedicacaoDoDiaEntity> buscarMedicacaoDoDiaAgendadoEConfirmado(Long idPet, LocalDate data, SituacaoAgendamento situacao);

    @Query("""
        SELECT m FROM MedicacaoDoDiaEntity m
          WHERE m.idMedicacaoDoDia = :idMedicacaoDoDia
            AND m.fkAgendamento.fkPet.idPet = :idPet
            AND m.fkAgendamento.fkCalendario.data = :data
            AND m.fkAgendamento.situacao = :situacao
    """)

    Optional<MedicacaoDoDiaEntity> buscarMedicacaoDoPetNoAgendamento(Long idMedicacaoDoDia,
                                                                     Long idPet,
                                                                     LocalDate data,
                                                                     SituacaoAgendamento situacao);
}
