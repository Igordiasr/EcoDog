package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.enums.OrigemMensagem;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "whatsapp_mensagem")
public class WhatsAppMensagemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMensagem;

    @ManyToOne
    @JoinColumn(name = "fk_atendimento")
    private WhatsAppAtendimentoEntity fkAtendimento;

    private String conteudo;
    @Enumerated(EnumType.STRING)
    private OrigemMensagem origem;
    private String messageSid;
    private Boolean simulada;
    private LocalDateTime criadaEm;

    protected WhatsAppMensagemEntity() {
    }

    public WhatsAppMensagemEntity(
            WhatsAppAtendimentoEntity fkAtendimento,
            String conteudo,
            OrigemMensagem origem,
            String messageSid,
            Boolean simulada
    ) {
        this.fkAtendimento = fkAtendimento;
        this.conteudo = conteudo;
        this.origem = origem;
        this.messageSid = messageSid;
        this.simulada = simulada;
        this.criadaEm = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
    }

    public Long getIdMensagem() {
        return idMensagem;
    }

    public void setIdMensagem(Long id) {
        this.idMensagem = id;
    }

    public WhatsAppAtendimentoEntity getFkAtendimento() {
        return fkAtendimento;
    }

    public void setFkAtendimento(WhatsAppAtendimentoEntity fkAtendimento) {
        this.fkAtendimento = fkAtendimento;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public OrigemMensagem getOrigem() {
        return origem;
    }

    public void setOrigem(OrigemMensagem origem) {
        this.origem = origem;
    }

    public String getMessageSid() {
        return messageSid;
    }

    public void setMessageSid(String messageSid) {
        this.messageSid = messageSid;
    }

    public Boolean getSimulada() {
        return simulada;
    }

    public void setSimulada(Boolean simulada) {
        this.simulada = simulada;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}
