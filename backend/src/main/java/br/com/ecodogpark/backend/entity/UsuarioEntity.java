package br.com.ecodogpark.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;
    @Column(nullable = false, length = 120) // posso adicionar o nome da coluna do banco de dados3
    private String nome;
    @Column(nullable = false, length = 11, unique = true)
    private String cpf;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(nullable = false, length = 20)
    private String telefone;
    @Column(nullable = false)
    private String senha;
    @Column(nullable = false)
    private LocalDate dataRegistro = LocalDate.now();
    @Column(nullable = false,  length = 1)
    private Integer nivelAcesso;

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long id) { this.idUsuario = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public LocalDate getDataRegistro() { return dataRegistro; }
    public void setDataRegistro(LocalDate dataRegistro) { this.dataRegistro = dataRegistro; }
    public Integer getNivelAcesso() { return nivelAcesso; }
    public void setNivelAcesso(Integer nivelAcesso) { this.nivelAcesso = nivelAcesso; }
}
