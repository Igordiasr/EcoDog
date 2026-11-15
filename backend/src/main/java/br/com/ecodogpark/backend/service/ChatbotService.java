package br.com.ecodogpark.backend.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class ChatbotService {
    AtendimentosPendentesService atendimentosPendentesService;

    public ChatbotService(AtendimentosPendentesService atendimentosPendentesService) {
        this.atendimentosPendentesService = atendimentosPendentesService;
    }

    public String responder(String remetente,String mensagem) {
        System.out.println("================================");
        System.out.println("Mensagem recebida!");
        System.out.println("Remetente: " + remetente);
        System.out.println("Mensagem: " + mensagem);
        System.out.println("================================");

        String texto = normalizar(mensagem.toLowerCase());

        if (texto.contains("horario") || texto.contains("funcionamento")) {
            return """
                    Nosso horário de funcionamento
                    Segunda a sexta - Entrada 07:00h/ Saída 18:00h
                    Sábado - Entrada 07:00h/ Saída 14:00h
                    """;
        } else if (
                texto.contains("preco")
                        || texto.contains("precos")
                        || texto.contains("valor")
                        || texto.contains("valores")
        ) {
            return """
                    Creche canina
                    DayUse (Diária avulsa) - R$90,00 dias normais/ R$100,00 feriados
                    Pacotes (valor mensal)
                    2x por semana: R$630,00
                    3x por semana: R$780,00
                    4x por semana: R$960,00
                    5x por semana: R$1.090,00
                    6x por semana: R$1.200,00
                    
                    Hotel
                    Valores a combinar
                    """;
        } else if (
                texto.contains("agendamento")
                        || texto.contains("agendar")
                        || texto.contains("reserva")
        ) {
            return """
                    Você pode fazer um agendamento através da nossa plataforma, clicando no link abaixo
                    Ecodog Park
                    """;
        } else if (
                texto.contains("atendente")
                        || texto.contains("humano")
                        || texto.contains("falar com alguém")
                        || texto.contains("falar com alguem")
        ) {
            atendimentosPendentesService.registrar(remetente, mensagem);
            System.out.println(
                    "Solicitação registrada. Aguardando atendimento humano."
            );
            return """
                    Sua solicitação de atendimento foi registrada.
                    Em breve nossa equipe entrará em contato para prosseguir com o atendimento!
                    """;
        } else if (
                texto.contains("oi")
                        || texto.contains("ola")
                        || texto.contains("bom dia")
                        || texto.contains("boa tarde")
                        || texto.contains("boa noite")
        ) {
            return """
                    Olá! 🐶 Bem-vindo à EcoDog Park!
                    Posso ajudar com horários, preços ou agendamentos.
                    Digite o assunto que deseja consultar.
                    """;
        } else {
            return """
                    Não consegui identificar sua dúvida.
                    Você pode perguntar sobre:
                    - Horários
                    - Preços
                    - Agendamentos
                    Ou digitar "atendente".
                    """;
        }
    }

    public String normalizar(String mensagem) {
        String texto = Normalizer.normalize(
                mensagem == null ? "" : mensagem,
                Normalizer.Form.NFD
        );

        return texto
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
