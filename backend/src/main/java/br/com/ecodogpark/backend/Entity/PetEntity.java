package br.com.ecodogpark.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pets")
public class PetEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column(nullable = false, length = 100)
        private String nome;
        private String raca;
        private Boolean castrado;
        private Integer idade;
        private String relacionamento;
        private LocalDate vermifugo;
        private LocalDate vacina;
        private String alergias;
        private Character sexo;
        private String plano;
        @Column(length = 1000)
        private String cuidadosEspeciais;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "usuario_id", nullable = false)
        private UsuarioEntity tutor;

        public Long getId() { return id; }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getRaca() {
            return raca;
        }

        public void setRaca(String raca) {
            this.raca = raca;
        }

        public Boolean getCastrado() {
            return castrado;
        }

        public void setCastrado(Boolean castrado) {
            this.castrado = castrado;
        }

        public UsuarioEntity getTutor() {
            return tutor;
        }

        public void setTutor(UsuarioEntity tutor) {
            this.tutor = tutor;
        }

        public Integer getIdade() {
            return idade;
        }

        public void setIdade(Integer idade) {
            this.idade = idade;
        }

        public String getRelacionamento() {
            return relacionamento;
        }

        public void setRelacionamento(String relacionamento) {
            this.relacionamento = relacionamento;
        }

        public LocalDate getVermifugo() {
            return vermifugo;
        }

        public void setVermifugo(LocalDate vermifugo) {
            this.vermifugo = vermifugo;
        }

        public LocalDate getVacina() {
            return vacina;
        }

        public void setVacina(LocalDate vacina) {
            this.vacina = vacina;
        }

        public String getAlergias() {
            return alergias;
        }

        public void setAlergias(String alergias) {
            this.alergias = alergias;
        }

        public Character getSexo() {
            return sexo;
        }

        public void setSexo(Character sexo) {
            this.sexo = sexo;
        }

        public String getPlano() {
            return plano;
        }

        public void setPlano(String plano) {
            this.plano = plano;
        }

        public String getCuidadosEspeciais() {
            return cuidadosEspeciais;
        }

        public void setCuidadosEspeciais(String cuidadosEspeciais) {
            this.cuidadosEspeciais = cuidadosEspeciais;
        }
}
