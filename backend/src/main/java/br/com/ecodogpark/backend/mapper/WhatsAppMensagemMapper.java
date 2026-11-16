package br.com.ecodogpark.backend.mapper;

import br.com.ecodogpark.backend.dto.TwilioDTO.WhatsAppMensagemResponse;
import br.com.ecodogpark.backend.entity.WhatsAppMensagemEntity;

import java.util.List;

public class WhatsAppMensagemMapper {
    public static WhatsAppMensagemResponse paraWhatsAppMensagemResponse(WhatsAppMensagemEntity mensagem) {
        return new WhatsAppMensagemResponse(
                mensagem.getIdMensagem(),
                mensagem.getConteudo(),
                mensagem.getOrigem(),
                mensagem.getSimulada(),
                mensagem.getCriadaEm()
        );
    }

    public static List<WhatsAppMensagemResponse> paraWhatsAppMensagemResponse(List<WhatsAppMensagemEntity> mensagens) {
        return mensagens.stream().map(WhatsAppMensagemMapper::paraWhatsAppMensagemResponse).toList();
    }
}
