package br.com.ecodogpark.backend.dto.FeedMonitorDTO;

import br.com.ecodogpark.backend.entity.SituacaoMedicacao;

public record MedicacaoDoDiaRequest(
        SituacaoMedicacao situacao,
        String observacao
) {
}
