package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppAtendimentoResponse;
import br.com.ecodogpark.backend.entity.WhatsAppAtendimentoEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WhatsAppAtendimentoMapper {
    public static WhatsAppAtendimentoResponse paraWhatsAppResponse(WhatsAppAtendimentoEntity atendimento) {
        return new WhatsAppAtendimentoResponse(
                atendimento.getIdAtendimento(),
                atendimento.getNumeroTutor(),
                atendimento.getSituacao(),
                atendimento.getIniciadoEm()
        );
    }

    public static List<WhatsAppAtendimentoResponse> paraWhatsAppResponse(List<WhatsAppAtendimentoEntity> atendimentos) {
        return atendimentos.stream().map(WhatsAppAtendimentoMapper::paraWhatsAppResponse).toList();
    }
}
