package br.com.ecodogpark.backend.dto.TutorDTO.response;

import br.com.ecodogpark.backend.entity.MedicacoesEntity;

public record MedicacaoParaListaResponse(
        MedicacoesEntity medicacao,
        Boolean emUso,
        String dosagem,
        String frequencia
) {
}
