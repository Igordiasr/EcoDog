package br.com.ecodogpark.backend.dto;

import br.com.ecodogpark.backend.entity.SituacaoMedicacao;

public record MedicacaoDiarioPetResponse(
        String nome,
        SituacaoMedicacao status
) {
}
