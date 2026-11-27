package br.com.ecodogpark.backend.repository;

import br.com.ecodogpark.backend.entity.WhatsAppMensagemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhatsAppMensagemRepository extends JpaRepository<WhatsAppMensagemEntity, Long> {
    Boolean existsByMessageSid(String messageSid);
    List<WhatsAppMensagemEntity> findByFkAtendimento_IdAtendimentoOrderByCriadaEmAsc(Long fkAtendimento);
}
