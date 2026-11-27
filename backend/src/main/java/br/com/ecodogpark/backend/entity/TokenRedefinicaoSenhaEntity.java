package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_redefinicao_senha")
public class TokenRedefinicaoSenhaEntity {
    @Id
    private String tokenHash;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_usuario")
    private UsuariosEntity usuario;
    private LocalDateTime criadoEm;
    private LocalDateTime expiraEm;
    private LocalDateTime utilizadoEm;

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public UsuariosEntity getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuariosEntity usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(LocalDateTime expiraEm) {
        this.expiraEm = expiraEm;
    }

    public LocalDateTime getUtilizadoEm() {
        return utilizadoEm;
    }

    public void setUtilizadoEm(LocalDateTime utilizadoEm) {
        this.utilizadoEm = utilizadoEm;
    }
}
