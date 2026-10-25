package br.com.ecodogpark.backend.dto.TutorDTO.response;

import br.com.ecodogpark.backend.entity.VacinasEntity;

import java.time.LocalDate;

public record VacinaParaListaResponse(
        VacinasEntity vacina,
        LocalDate dataAplicacao,
        LocalDate dataValidade
) {
}
