package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;

public record PetResponse(
        Long id, String nome, String raca, Boolean castrado, Long tutorId,
        Integer idade, String relacionamento, LocalDate vermifugo, LocalDate vacina,
        String alergias, Character sexo, String plano, String cuidadosEspeciais) {
}
