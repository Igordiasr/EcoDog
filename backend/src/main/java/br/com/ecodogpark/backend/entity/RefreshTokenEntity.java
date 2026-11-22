package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "refresh_token")
public class RefreshTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRefresh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_usuario")
    private UsuariosEntity fkUsuario;

    private String tokenHash;
    private UUID familiaId;
    private LocalDateTime criadoEm;
    private LocalDateTime expiradoEm;
    private LocalDateTime utilizadoEm;
    private LocalDateTime revogadoEm;

    protected RefreshTokenEntity() {}

    public Long getIdRefresh() {
        return idRefresh;
    }

    public void setIdRefresh(Long idRefresh) {
        this.idRefresh = idRefresh;
    }

    public UsuariosEntity getFkUsuario() {
        return fkUsuario;
    }

    public void setFkUsuario(UsuariosEntity fkUsuario) {
        this.fkUsuario = fkUsuario;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public UUID getFamiliaId() {
        return familiaId;
    }

    public void setFamiliaId(UUID familiaId) {
        this.familiaId = familiaId;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getExpiradoEm() {
        return expiradoEm;
    }

    public void setExpiradoEm(LocalDateTime expiradoEm) {
        this.expiradoEm = expiradoEm;
    }

    public LocalDateTime getUtilizadoEm() {
        return utilizadoEm;
    }

    public void setUtilizadoEm(LocalDateTime utilizadoEm) {
        this.utilizadoEm = utilizadoEm;
    }

    public LocalDateTime getRevogadoEm() {
        return revogadoEm;
    }

    public void setRevogadoEm(LocalDateTime revogadoEm) {
        this.revogadoEm = revogadoEm;
    }
}
