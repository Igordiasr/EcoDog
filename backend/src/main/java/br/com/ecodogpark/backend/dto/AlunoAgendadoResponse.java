package br.com.ecodogpark.backend.dto;

public record AlunoAgendadoResponse(
        Long idAgendamento,
        Long idPet,
        String nome,
        String raca,
        Integer idade,
        String tutor,
        String situacao
) {}
