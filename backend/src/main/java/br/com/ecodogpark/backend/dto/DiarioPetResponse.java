package br.com.ecodogpark.backend.dto;

public record DiarioPetResponse (
        Integer idAtividades, String nome, Long duracao, Boolean status) {
}