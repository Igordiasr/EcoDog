package br.com.ecodogpark.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record DiarioPetResponseDTO(
        Long petId,
        LocalDate data,
        ResumoDTO resumo,
        List<AtividadeDTO> atividades,
        List<MedicacaoDTO> medicacoes,
        String observacoes
) {
}
