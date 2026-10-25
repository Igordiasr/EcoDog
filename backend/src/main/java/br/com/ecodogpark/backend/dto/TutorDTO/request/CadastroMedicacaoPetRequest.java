package br.com.ecodogpark.backend.dto.TutorDTO.request;

import br.com.ecodogpark.backend.entity.MedicacoesEntity;

public record CadastroMedicacaoPetRequest(
        MedicacoesEntity medicacao,
        String frequencia,
        String dosagem,
        Boolean emUso
) {
}
