package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record DiarioPetResponse(
        Long idPet,
        LocalDate data,
        ResumoDiarioPetResponse resumo,
        List<AtividadeDiarioPetResponse> atividades,
        List<MedicacaoDiarioPetResponse> medicacoes,
        String observacoes
) {
}
