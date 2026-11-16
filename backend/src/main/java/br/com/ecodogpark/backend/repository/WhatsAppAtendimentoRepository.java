package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.SituacaoAgendamento;
import br.com.ecodogpark.backend.entity.WhatsAppAtendimentoEntity;
import br.com.ecodogpark.backend.enums.SituacaoAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WhatsAppAtendimentoRepository extends JpaRepository<WhatsAppAtendimentoEntity, Long> {
    Optional<WhatsAppAtendimentoEntity> findFirstByNumeroTutorAndSituacaoInOrderByIniciadoEmDesc(
            String numeroTutor,
            Collection<SituacaoAtendimento> situacao
    );
    List<WhatsAppAtendimentoEntity> findBySituacaoOrderByIniciadoEmAsc(SituacaoAtendimento situacao);
}
