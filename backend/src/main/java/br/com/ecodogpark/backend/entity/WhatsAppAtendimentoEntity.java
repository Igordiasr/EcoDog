package br.com.ecodogpark.backend.entity;

import br.com.ecodogpark.backend.enums.SituacaoAtendimento;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "whatsapp_atendimento")
public class WhatsAppAtendimentoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAtendimento;
    private String numeroTutor;
    @Enumerated(EnumType.STRING)
    private SituacaoAtendimento situacao;
    private LocalDateTime iniciadoEm;
    private LocalDateTime encerradoEm;

    protected WhatsAppAtendimentoEntity() {
    }

    public WhatsAppAtendimentoEntity(String numeroTutor) {
        this.numeroTutor = numeroTutor;
        this.situacao = SituacaoAtendimento.AUTOMATICO;
        this.iniciadoEm = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
    }

    public Long getIdAtendimento() {
        return idAtendimento;
    }

    public void setIdAtendimento(Long id) {
        this.idAtendimento = id;
    }

    public String getNumeroTutor() {
        return numeroTutor;
    }

    public void setNumeroTutor(String numeroTutor) {
        this.numeroTutor = numeroTutor;
    }

    public SituacaoAtendimento getSituacao() {
        return situacao;
    }

    public void setSituacao(SituacaoAtendimento situacao) {
        this.situacao = situacao;
    }

    public LocalDateTime getIniciadoEm() {
        return iniciadoEm;
    }

    public void setIniciadoEm(LocalDateTime iniciadoEm) {
        this.iniciadoEm = iniciadoEm;
    }

    public LocalDateTime getEncerradoEm() {
        return encerradoEm;
    }

    public void setEncerradoEm(LocalDateTime encerradoEm) {
        this.encerradoEm = encerradoEm;
    }
}
