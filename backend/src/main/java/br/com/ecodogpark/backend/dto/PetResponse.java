package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;

public record PetResponse(
        Long id, String nome, String raca, Boolean castrado, Long tutorId,
        LocalDate dataNascimento, String relacaoComOutros, Character sexo, String cuidadosEspeciais) {
}
